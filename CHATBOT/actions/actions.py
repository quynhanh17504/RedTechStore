import requests
import json
import google.generativeai as genai
from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet

# Cấu hình Gemini (Dùng API Key của bạn)
genai.configure(api_key="AIzaSyCY3f68VIIDwF2eF9P4PSxym-vjAn0blKs")

class ActionSearchProduct(Action):
    def name(self) -> Text:
        return "action_search_product"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        # 1. Lấy thực thể và thông tin từ người dùng
        product_name = tracker.get_slot("product_name")
        brand = tracker.get_slot("brand")
        category = tracker.get_slot("category")
        user_msg = tracker.latest_message.get('text', '').lower()
        
        # Nhận diện mục đích qua từ khóa
        is_checking_stock = any(word in user_msg for word in ["còn", "có sẵn", "tồn kho", "số lượng", "hết hàng"])
        is_asking_sale = any(word in user_msg for word in ["giảm giá", "sale", "khuyến mãi", "flash sale"])
        is_asking_best = any(word in user_msg for word in ["bán chạy", "hot", "phổ biến"])

        # 2. Xây dựng tham số gửi lên API Node.js
        api_url = "http://localhost:3005/client/chatbot/search" 
        params = {}

        if is_asking_sale:
            params["type"] = "flash-sale"
        elif is_asking_best:
            params["type"] = "best-sellers"
        else:
    
            if category:
                params["search"] = category
            elif product_name:
                params["search"] = product_name
            else:
                params["search"] = user_msg

        try:
            r = requests.get(api_url, params=params, timeout=5)
            products = r.json()

            if products and len(products) > 0:
                # --- PHẦN 1: PHẢN HỒI VĂN BẢN ---
                if is_checking_stock:
                    p_match = products[0]
                    stock_count = p_match.get('stock', 0)
                    if stock_count > 0:
                        dispatcher.utter_message(text=f"✅ Dạ sản phẩm **{p_match['name']}** hiện đang còn **{stock_count}** máy tại RedTechStore ạ!")
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
                for p in products[:6]:
                    img_array = p.get('image', [])
                    first_img = img_array[0] if isinstance(img_array, list) and len(img_array) > 0 else "default.jpg"
                    img_url = first_img if str(first_img).startswith("http") else f"http://localhost:3005/uploads/{first_img}"

                    product_cards.append({
                        "id": p['id'],
                        "name": p['name'],
                        "price": p['price'],
                        "image": img_url,
                        "stock": p.get('stock', 0),
                        "link": f"/product/{p['id']}"
                    })
                
                dispatcher.utter_message(attachment={"type": "product_cards", "data": product_cards})
            
            else:
                dispatcher.utter_message(text="Dạ hiện tại RedTechStore chưa tìm thấy sản phẩm nào đúng ý bạn. Bạn thử kiểm tra lại tên sản phẩm hoặc thương hiệu nhé!")
        
        except Exception as e:
            print(f"❌ Lỗi Action Server: {e}")
            dispatcher.utter_message(text="Hệ thống tra cứu của em đang gặp chút trục trặc, bạn đợi em một lát nhé!")

        # 3. QUAN TRỌNG: Reset Slots để không bị lưu tên sản phẩm cũ cho câu hỏi sau
        return [SlotSet("product_name", None), SlotSet("category", None), SlotSet("brand", None)]

class ActionGeminiTalk(Action):
    def name(self) -> Text:
        return "action_gemini_talk"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        user_msg = tracker.latest_message.get('text')
        model_priority = ['gemini-1.5-flash', 'gemini-1.5-flash-8b'] # Dùng bản ổn định cho đồ án
        
        chat_context = f"Bạn là RT-Bot - trợ lý thân thiện của shop đồ công nghệ RedTechStore. Khách hỏi: {user_msg}. Trả lời ngắn gọn, lịch sự."

        for model_name in model_priority:
            try:
                model = genai.GenerativeModel(model_name)
                response = model.generate_content(
                    chat_context,
                    generation_config=genai.types.GenerationConfig(max_output_tokens=250, temperature=0.7)
                )
                
                if response and response.text:
                    dispatcher.utter_message(text=response.text)
                    return [] 
            except Exception:
                continue

        dispatcher.utter_message(text="Dạ em đây, bạn cần em tư vấn thêm gì về sản phẩm không ạ?")
        return []