from app import app
from app.utils.llm import prepare_llm
# from gevent.pywsgi import WSGIServer

if __name__ == '__main__':
    # app.run(host='0.0.0.0', port=443, ssl_context=('cert.pem', 'key.pem'))
    
    prepare_llm()
    app.run(host='0.0.0.0', port=8080, debug=True)
    # http_server = WSGIServer(('0.0.0.0', 8080), app, keyfile='key.pem', certfile='cert.pem')
    # http_server.serve_forever()
