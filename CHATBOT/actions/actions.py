import requests
import json
from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher

class ActionSearchProduct(Action):
    def name(self) -> Text:
        return "action_search_product"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        # 1. Lấy thông tin từ các Slots
        category = tracker.get_slot("category")
        brand = tracker.get_slot("brand")
        product_name = tracker.get_slot("product_name")
        filter_new = tracker.get_slot("filter_new")

        # 2. Tạo chuỗi tìm kiếm tổng hợp
        search_query = f"{product_name or ''} {brand or ''} {category or ''}".strip()
        
        if filter_new and not search_query:
            search_query = ""

        try:
            # 3. Gọi API Backend Node.js (Cổng 3005)
            r = requests.get(f"http://localhost:3005/client/products", params={"search": search_query}, timeout=5)
            products = r.json()

            if products:
                dispatcher.utter_message(text=f"RT Bot tìm thấy {len(products)} sản phẩm phù hợp:")
                
                product_cards = []
                for p in products[:4]:
                    # --- XỬ LÝ HÌNH ẢNH THÔNG MINH ---
                    raw_image = p.get('image')
                    img_url = "http://localhost:3005/uploads/default-product.jpg" # Ảnh mặc định
                    
                    if raw_image:
                        try:
                            # Nếu là mảng JSON string, parse lấy phần tử đầu
                            imgs = json.loads(raw_image) if isinstance(raw_image, str) and raw_image.startswith('[') else raw_image
                            first_img = imgs[0] if isinstance(imgs, list) else imgs
                            
                            # KIỂM TRA: Nếu là link tuyệt đối (Cloudinary/HTTP) thì không cộng localhost
                            if str(first_img).startswith("http"):
                                img_url = first_img
                            else:
                                img_url = f"http://localhost:3005/uploads/{first_img}"
                        except Exception:
                            img_url = f"http://localhost:3005/uploads/{raw_image}"

                    product_cards.append({
                        "id": p['id'],
                        "name": p['name'],
                        "price": p['price'],
                        "image": img_url,
                        "link": f"/product/{p['id']}"
                    })
                
                # Gửi payload về cho React
                dispatcher.utter_message(attachment={"type": "product_cards", "data": product_cards})
            else:
                dispatcher.utter_message(text="Rất tiếc, mình không tìm thấy sản phẩm nào khớp với yêu cầu.")
        
        except Exception as e:
            print(f"❌ Lỗi Action Search: {e}")
            dispatcher.utter_message(text="Hệ thống tra cứu đang bận, bạn đợi tí nhé!")

        return []