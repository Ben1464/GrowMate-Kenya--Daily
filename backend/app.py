# app.py
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
import os

# Initialize Flask app
app = Flask(__name__)

# Database setup with SQLite
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(BASE_DIR, 'sales.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize database and marshmallow
db = SQLAlchemy(app)
ma = Marshmallow(app)

# Define the model
class DailySale(db.Model):
    __tablename__ = 'daily_sales'
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, nullable=False)
    category = db.Column(db.String(50), nullable=False)
    product = db.Column(db.String(50), nullable=False)
    pack_size = db.Column(db.String(20), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Float, nullable=False)
    total = db.Column(db.Float, nullable=False)
    user_id = db.Column(db.Integer, nullable=False)

# Define the schema
class DailySaleSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = DailySale
        load_instance = True

# Initialize database
with app.app_context():
    db.create_all()

# Routes
@app.route('/sales', methods=['POST'])
def add_sale():
    sale_data = request.get_json()
    sale_schema = DailySaleSchema()
    new_sale = sale_schema.load(sale_data)
    db.session.add(new_sale)
    db.session.commit()
    return sale_schema.jsonify(new_sale), 201

@app.route('/sales', methods=['GET'])
def get_sales():
    sales = DailySale.query.all()
    sale_schema = DailySaleSchema(many=True)
    return jsonify(sale_schema.dump(sales))

# Run the app
if __name__ == "__main__":
    app.run(debug=True)
