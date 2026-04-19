import requests
import json
import google.generativeai as genai
from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher

# Cấu hình Gemini (Thay bằng API Key thật của bạn)
genai.configure(api_key="AIzaSyCY3f68VIIDwF2eF9P4PSxym-vjAn0blKs")

class ActionSearchProduct(Action):
    def name(self) -> Text:
        return "action_search_product"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        # 1. Lấy thực thể từ Rasa NLU
        product_name = tracker.get_slot("product_name")
        brand = tracker.get_slot("brand")
        category = tracker.get_slot("category")
        user_msg = tracker.latest_message.get('text', '').lower()
        
        # Nhận diện mục đích qua từ khóa
        is_checking_stock = any(word in user_msg for word in ["còn", "có sẵn", "tồn kho", "số lượng", "hết hàng"])
        is_asking_sale = any(word in user_msg for word in ["giảm giá", "sale", "khuyến mãi", "flash sale"])
        is_asking_best = any(word in user_msg for word in ["bán chạy", "hot", "phổ biến"])

        # 2. Gọi API Backend Node.js
        api_url = "http://localhost:3005/client/chatbot/search" 
        params = {}

        if is_asking_sale:
            params["type"] = "flash-sale"
        elif is_asking_best:
            params["type"] = "best-sellers"
        else:
            # Ưu tiên lấy tên sản phẩm, nếu không có mới tìm theo brand/category
            params["search"] = product_name if product_name else f"{brand or ''} {category or ''}".strip()

        try:
            r = requests.get(api_url, params=params, timeout=5)
            products = r.json()

            if products and len(products) > 0:
                # --- PHẦN 1: PHẢN HỒI VĂN BẢN (XỬ LÝ TỒN KHO) ---
                if is_checking_stock:
                    p_match = products[0]
                    stock_count = p_match.get('stock', 0)
                    if stock_count > 0:
                        dispatcher.utter_message(text=f"✅ Dạ sản phẩm **{p_match['name']}** hiện đang còn **{stock_count}** sản phẩm tại RedTechStore ạ!")
                    else:
                        dispatcher.utter_message(text=f"❌ Rất tiếc, sản phẩm **{p_match['name']}** hiện tại đang tạm hết hàng rồi ạ.")
                
                elif is_asking_sale:
                    dispatcher.utter_message(text="🔥 Đừng bỏ lỡ các sản phẩm đang Flash Sale giá cực hời nè:")
                
                elif is_asking_best:
                    dispatcher.utter_message(text="🌟 Đây là danh sách sản phẩm bán chạy nhất tại shop mình:")
                
                else:
                    dispatcher.utter_message(text=f"RT Bot tìm thấy {len(products)} sản phẩm phù hợp với ý bạn đây:")

                # --- PHẦN 2: GỬI DỮ LIỆU CARD SẢN PHẨM ---
                product_cards = []
                for p in products[:6]: # Hiển thị tối đa 6 Card
                    # Lấy ảnh đầu tiên trong mảng ảnh đã xử lý từ Backend
                    img_array = p.get('image', [])
                    first_img = img_array[0] if isinstance(img_array, list) and len(img_array) > 0 else "default.jpg"
                    
                    # Tạo URL ảnh hoàn chỉnh
                    img_url = first_img if str(first_img).startswith("http") else f"http://localhost:3005/uploads/{first_img}"

                    product_cards.append({
                        "id": p['id'],
                        "name": p['name'],
                        "price": p['price'],
                        "image": img_url,
                        "stock": p.get('stock', 0),
                        "link": f"/product/{p['id']}" # Đường dẫn để React Navigate
                    })
                
                # Gửi payload attachment (React sẽ dùng cái này để render giao diện Card)
                dispatcher.utter_message(attachment={"type": "product_cards", "data": product_cards})
            
            else:
                dispatcher.utter_message(text="Dạ hiện tại RedTechStore chưa tìm thấy sản phẩm nào đúng ý bạn. Bạn thử kiểm tra lại tên sản phẩm hoặc thương hiệu nhé!")
        
        except Exception as e:
            print(f"❌ Lỗi Action Server: {e}")
            dispatcher.utter_message(text="Hệ thống tra cứu của em đang gặp chút trục trặc, bạn đợi em một lát nhé!")

        return []
class ActionGeminiTalk(Action):
    def name(self) -> Text:
        return "action_gemini_talk"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        user_msg = tracker.latest_message.get('text')
        
        # Danh sách ưu tiên: Đưa 2.5 Flash lên đầu theo ý bạn
        model_priority = [
            'gemini-2.5-flash', 
            'gemini-2.0-flash', 
            'gemini-1.5-flash'
        ]
        
        # Rút ngắn context tối đa để tiết kiệm Quota Token (vì bản 2.5 đang bị giới hạn token)
        chat_context = f"Bạn là RT-Bot shop RedTech. Trả lời: {user_msg}"

        for model_name in model_priority:
            try:
                print(f"--- Đang gọi model: {model_name}")
                model = genai.GenerativeModel(model_name)
                
                # Cấu hình giảm bớt độ dài phản hồi để tránh lỗi Quota
                response = model.generate_content(
                    chat_context,
                    generation_config=genai.types.GenerationConfig(
                        max_output_tokens=300, 
                        temperature=0.7
                    )
                )
                
                if response and response.text:
                    dispatcher.utter_message(text=response.text)
                    return [] 
            
            except Exception as e:
                error_str = str(e)
                if "429" in error_str:
                    print(f"⚠️ {model_name} hết Quota token, đang chuyển...")
                    continue
                else:
                    print(f"❗ Lỗi {model_name}: {error_str[:100]}")
                    continue

        dispatcher.utter_message(text="Dạ RT-Bot nghe đây, hiện tại em hơi bận chút, bạn cần hỏi gì không ạ?")
        return []