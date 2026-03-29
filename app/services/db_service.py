import mysql.connector
from app.config import DB_CONFIG

def get_db_connection():
    conn = mysql.connector.connect(**DB_CONFIG)
    return conn
