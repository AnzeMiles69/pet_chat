from flask import Flask, render_template, request, jsonify
import numpy as np
from scipy import special
import math

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/calculate', methods=['POST'])
def calculate():
    data = request.get_json()
    operation = data.get('operation')
    numbers = data.get('numbers', [])
    
    try:
        if operation == 'add':
            result = sum(numbers)
        elif operation == 'multiply':
            result = np.prod(numbers)
        elif operation == 'sin':
            result = math.sin(math.radians(numbers[0]))
        elif operation == 'cos':
            result = math.cos(math.radians(numbers[0]))
        elif operation == 'tan':
            result = math.tan(math.radians(numbers[0]))
        elif operation == 'sqrt':
            result = math.sqrt(numbers[0])
        elif operation == 'power':
            result = math.pow(numbers[0], numbers[1])
        elif operation == 'log':
            result = math.log(numbers[0], numbers[1] if len(numbers) > 1 else 10)
        elif operation == 'factorial':
            result = math.factorial(int(numbers[0]))
        elif operation == 'bessel':
            result = special.jv(0, numbers[0])
        else:
            return jsonify({'error': 'Неизвестная операция'}), 400
            
        return jsonify({'result': result})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True) 