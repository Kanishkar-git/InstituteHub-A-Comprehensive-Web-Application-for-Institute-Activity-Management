import requests
try:
    response = requests.post("http://127.0.0.1:8000/api/ai/chat", json={"query":"Hi", "context":{"a":"b"}})
    print(response.json())
except Exception as e:
    print(e)
