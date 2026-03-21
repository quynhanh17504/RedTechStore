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

        # Xác định ý định người dùng qua từ khóa
        user_msg = tracker.latest_message.get('text', '').lower()
        is_checking_stock = any(word in user_msg for word in ["còn", "có sẵn", "tồn kho", "số lượng"])
        is_asking_sale = any(word in user_msg for word in ["giảm giá", "sale", "flash sale", "khuyến mãi"])
        is_asking_best = any(word in user_msg for word in ["bán chạy", "hot", "phổ biến"])

        # 2. Quyết định API Endpoint
        # Mặc định là tìm kiếm chung
        api_url = "http://localhost:3005/client/products"
        params = {}

        if is_asking_sale:
            api_url = "http://localhost:3005/client/products/flash-sale"
        elif is_asking_best:
            api_url = "http://localhost:3005/client/products/best-sellers"
        else:
            search_query = f"{product_name or ''} {brand or ''} {category or ''}".strip()
            if filter_new and not search_query:
                search_query = ""
            params["search"] = search_query

        try:
            # 3. Gọi API Backend Node.js
            r = requests.get(api_url, params=params, timeout=5)
            products = r.json()

            if products:
                # --- XỬ LÝ PHẢN HỒI VĂN BẢN ---
                if is_checking_stock and product_name:
                    # Lấy sản phẩm đầu tiên khớp nhất để báo tồn kho
                    p_match = products[0]
                    stock = p_match.get('stock', 0)
                    if stock > 0:
                        dispatcher.utter_message(text=f"✅ Dạ còn hàng ạ! {p_match['name']} hiện đang sẵn có {stock} cái tại cửa hàng.")
                    else:
                        dispatcher.utter_message(text=f"❌ Rất tiếc, {p_match['name']} hiện tại đang tạm hết hàng rồi ạ.")
                elif is_asking_sale:
                    dispatcher.utter_message(text="🔥 Đây là các sản phẩm Flash Sale giá cực hời cho bạn:")
                elif is_asking_best:
                    dispatcher.utter_message(text="🌟 Top những sản phẩm bán chạy nhất tại RedTechStore:")
                else:
                    dispatcher.utter_message(text=f"RT Bot tìm thấy {len(products)} sản phẩm phù hợp:")

                # --- XỬ LÝ DANH SÁCH CARD SẢN PHẨM ---
                product_cards = []
                for p in products[:8]: # Lấy tối đa 8 cái để trượt ngang cho sướng
                    # Xử lý hình ảnh
                    raw_image = p.get('image')
                    img_url = "http://localhost:3005/uploads/default-product.jpg"
                    
                    if raw_image:
                        try:
                            imgs = json.loads(raw_image) if isinstance(raw_image, str) and raw_image.startswith('[') else raw_image
                            first_img = imgs[0] if isinstance(imgs, list) else imgs
                            
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
                        "link": f"/product/{p['id']}",
                        "stock": p.get('stock', 0)
                    })
                
                # Gửi payload về cho React
                dispatcher.utter_message(attachment={"type": "product_cards", "data": product_cards})
            
            else:
                dispatcher.utter_message(text="Dạ hiện tại mình chưa tìm thấy sản phẩm nào khớp với yêu cầu của bạn rồi.")
        
        except Exception as e:
            print(f"❌ Lỗi Action Server: {e}")
            dispatcher.utter_message(text="Hệ thống tra cứu của RedTechStore đang bận, bạn đợi tí nhé!")

        return []