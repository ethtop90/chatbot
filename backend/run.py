from app import app
from app.utils.llm import prepare_llm
from flup.server.fcgi import WSGIServer

if __name__ == '__main__':
    # app.run(host='0.0.0.0', port=443, ssl_context=('cert.pem', 'key.pem'))
    # app.run(host='0.0.0.0', port=8080, debug=True)
    WSGIServer(app, bindAddress=('0.0.0.0', 8080), certfile='cert.pem', keyfile='key.pem').run()
    prepare_llm()