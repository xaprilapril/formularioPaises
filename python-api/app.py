from datetime import datetime
import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import sqlite3


PUERTO = 5000
ARCHIVO_BASE_DATOS = Path(__file__).with_name('organizaciones.db')


def inicializar_base_datos() -> None:
    with sqlite3.connect(ARCHIVO_BASE_DATOS) as conexion:
        conexion.execute(
            '''
            CREATE TABLE IF NOT EXISTS organizaciones (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                fecha_registro TEXT NOT NULL,
                nombre TEXT NOT NULL,
                siglas TEXT NOT NULL,
                pais TEXT NOT NULL,
                capital TEXT NOT NULL,
                bandera TEXT NOT NULL,
                moneda TEXT NOT NULL
            )
            '''
        )
        conexion.commit()


class ApiHandler(BaseHTTPRequestHandler):
    def _set_cors(self) -> None:
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')

    def _enviar_json(self, codigo: int, cuerpo: dict) -> None:
        payload = json.dumps(cuerpo, ensure_ascii=False).encode('utf-8')
        self.send_response(codigo)
        self._set_cors()
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def do_OPTIONS(self) -> None:
        self.send_response(204)
        self._set_cors()
        self.end_headers()

    def do_GET(self) -> None:
        if self.path == '/health':
            self._enviar_json(200, {'mensaje': 'API activa'})
            return

        self._enviar_json(404, {'error': 'Ruta no encontrada'})

    def do_POST(self) -> None:
        if self.path != '/api/organizaciones':
            self._enviar_json(404, {'error': 'Ruta no encontrada'})
            return

        try:
            longitud = int(self.headers.get('Content-Length', '0'))
            contenido = self.rfile.read(longitud).decode('utf-8')
            datos = json.loads(contenido)
        except (ValueError, json.JSONDecodeError):
            self._enviar_json(400, {'error': 'JSON inválido'})
            return

        campos = ['nombre', 'siglas', 'pais', 'capital', 'bandera', 'moneda']
        faltantes = [campo for campo in campos if not str(datos.get(campo, '')).strip()]

        if faltantes:
            self._enviar_json(400, {'error': 'Faltan campos obligatorios', 'campos': faltantes})
            return

        fecha_registro = datetime.now().isoformat(timespec='seconds')

        try:
            with sqlite3.connect(ARCHIVO_BASE_DATOS) as conexion:
                cursor = conexion.execute(
                    '''
                    INSERT INTO organizaciones
                    (fecha_registro, nombre, siglas, pais, capital, bandera, moneda)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    ''',
                    (
                        fecha_registro,
                        datos['nombre'],
                        datos['siglas'],
                        datos['pais'],
                        datos['capital'],
                        datos['bandera'],
                        datos['moneda'],
                    ),
                )
                conexion.commit()
        except sqlite3.Error:
            self._enviar_json(500, {'error': 'No se pudo guardar la información en la base de datos'})
            return

        self._enviar_json(
            201,
            {
                'mensaje': 'Organización guardada',
                'id': cursor.lastrowid,
                'base_datos': str(ARCHIVO_BASE_DATOS.name),
            },
        )


def main() -> None:
    inicializar_base_datos()
    servidor = ThreadingHTTPServer(('0.0.0.0', PUERTO), ApiHandler)
    print(f'API escuchando en http://localhost:{PUERTO}')
    servidor.serve_forever()


if __name__ == '__main__':
    main()