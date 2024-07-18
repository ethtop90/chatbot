from app import app
from app.utils.llm import prepare_llm

if __name__ == '__main__':
    # app.run(host='0.0.0.0', port=443, ssl_context=('cert.pem', 'key.pem'))
    app.run(host='0.0.0.0', port=8080, debug=True)
    prepare_llm()