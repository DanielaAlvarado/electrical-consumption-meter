from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import hashlib

config = {
  'user': 'root',
  'passwd': '',
  'host': 'localhost',
  'database': 'IotDB'
}

app = Flask(__name__)
CORS(app)



############################
#                          #
#   ADMINISTRADOR / USER   #
#                          #
############################

# @app.route("/login", methods=['GET'])
# def Login():
# 	mydb = mysql.connector.connect(**config)

# 	mycursor = mydb.cursor()
# 	username = request.args.get('username')
# 	password = request.args.get('password')

# 	salt="asdfghjkl"+password
# 	b=bytes(salt, "utf8")
# 	encriptado = hashlib.md5(b).hexdigest()


# 	mycursor = mydb.cursor()
# 	username = request.args.get('username')
# 	password = request.args.get('password')


# 	val = (username,)
# 	mycursor.callproc('LoginAdministrador', val)
# 	perfil = "Admin"
# 	row = list(mycursor.stored_results())[0].fetchall()
# 	a = True
# 	if(len(row)==0):
# 		val = (username, )
# 		mycursor.callproc('LoginUser', val)
# 		perfil = "User"
# 		row = list(mycursor.stored_results())[0].fetchall()
# 		if(len(row)==0):
# 				a = False

# 	print(row)
# 	if a:
# 		print(encriptado)
# 		if(row[0][3] == encriptado):
# 			return perfil, 200
# 	return "", 401

@app.route("/login", methods=['GET'])
def Login():
	mydb = mysql.connector.connect(**config)

	mycursor = mydb.cursor()
	email = request.args.get('email')
	password = request.args.get('password')

	salt = "asdfghjkl" + email
	b = bytes(salt, "utf8")
	encriptado = hashlib.md5(b).hexdigest()

	mycursor = mydb.cursor()
	email = request.args.get('email')
	password = request.args.get('password')

	val = (email,)
	sql = "SELECT * FROM user WHERE email = %s"
	mycursor.execute(sql, val)
	row = mycursor.fetchone()

	if(len(row) == 0):
		return "", 404

	val = (encriptado,)
	mycursor.callproc('PasswordAdministrador', val)
	row = mycursor.fetchone()

	if(len(row) == 0):
		return "", 400

	return perfil, 200



@app.route("/insert", methods=['GET'])
def Insert():
	mydb = mysql.connector.connect(**config)
	mycursor = mydb.cursor()

	name = request.args.get('name')
	email = request.args.get('email')
	password = request.args.get('password')
	stage = request.args.get('stage')
	admin = request.args.get('admin')


	salt="asdfghjkl"+password
	b=bytes(salt, "utf8")
	encriptado = hashlib.md5(b).hexdigest()

	try:
		args = (name, email, encriptado, admin)
		mycursor.callproc('insertUser', args)
	except mysql.connector.IntegrityError:
		return "409"

	email = request.args.get('email')
	sql = "SELECT id_user FROM user WHERE email = %s"
	val = (email,)
	mycursor.execute(sql, val)
	id_user = mycursor.fetchone()

	sql = "INSERT INTO user_has_stage (user_id_user, user_admin_id_admin, stage_id_stage) VALUES (%s,%s,%s)"
	val = (id_user[0], admin, stage)
	mycursor.execute(sql, val)
	
	print("entro a insert")
	mydb.commit()
	print(mycursor.rowcount,"record inserted.")
	return "200"

@app.route("/delete", methods=['GET'])
def Delete():

	mydb = mysql.connector.connect(**config)
	mycursor = mydb.cursor()
	username = request.args.get('username')

	sql = "DELETE FROM user WHERE username = %s"
	val = (username,)
	mycursor.execute(sql, val)

	print(mycursor.rowcount,"record deleted.")
	mydb.commit()

	return "."

@app.route("/modify", methods=['GET'])
def Modify():
	mydb = mysql.connector.connect(**config)
	mycursor = mydb.cursor(buffered=True)

	username = request.args.get('username')
	name = request.args.get('name')
	email = request.args.get('email')
	status = request.args.get('status')

	sql = "UPDATE user SET name = %s, email = %s, status = %s WHERE username = %s"
	val = (name, email, status, username)
	mycursor.execute(sql, val)

	mydb.commit()
	return "", 200

#Dado un username
@app.route("/searchAdmin", methods=['GET'])
def Search():

	mydb = mysql.connector.connect(**config)
	mycursor = mydb.cursor(buffered=True)
	id_admin = request.args.get('id_admin')

	val = (id_admin,)
	#mycursor.callproc('buscarUser', val)
	sql = "SELECT name, email FROM admin WHERE id_admin = %s;"
	mycursor.execute(sql, val)
	row = mycursor.fetchone()

	user = {}
	admin = []
	while row is not None:
		id_admin = {}
		id_admin["name"] = row[0]
		id_admin["email"] = row[1]
		admin.append(id_admin)
		row = mycursor.fetchone()

	user["user"] = admin
	return jsonify(user), 200

@app.route("/showAllUser", methods=['GET'])
def ShowAll():

	mydb = mysql.connector.connect(**config)
	mycursor = mydb.cursor(buffered=True)
	id_admin = request.args.get('id_admin')

	val = (id_admin,)
	#mycursor.callproc('buscarUser', val)
	sql = "SELECT name, email FROM user WHERE admin_id_admin = %s;"
	mycursor.execute(sql, val)
	row = mycursor.fetchone()

	items = {}
	admin = []
	while row is not None:
		user = {}
		user["name"] = row[0]
		user["email"] = row[1]
		admin.append(user)
		row = mycursor.fetchone()

	items["items"] = admin
	return jsonify(items), 200

############################
#                          #
#        ESPACIOS          #       
#                          #
############################


#############################  STAGE   #################################

@app.route("/insertStage", methods=['GET'])
def InsertStage():
	mydb = mysql.connector.connect(**config)

	mycursor = mydb.cursor()
	name = request.args.get('name')
	user = request.args.get('user')
	admin = request.args.get('admin')

	try:
		args = (name, admin)
		mycursor.callproc('insertStage', args)
	except mysql.connector.IntegrityError:
		return "409"
	
	print("entro a insert")
	mydb.commit()
	print(mycursor.rowcount,"record inserted.")
	return "200"


@app.route("/deleteStage", methods=['GET'])
def DeleteStage():

	mydb = mysql.connector.connect(**config)
	mycursor = mydb.cursor()
	id_stage = request.args.get('id_stage')

	sql = "DELETE FROM stage WHERE id_stage = %s"
	val = (id_stage,)
	mycursor.execute(sql, val)

	print(mycursor.rowcount,"record deleted.")
	mydb.commit()

	return "."

#Dado un id_stage
@app.route("/searchStage", methods=['GET'])
def SearchStage():

	mydb = mysql.connector.connect(**config)
	mycursor = mydb.cursor(buffered=True)
	id_admin = request.args.get('id_admin')

	val = (id_admin,)
	#mycursor.callproc('buscarStage', val)

	sql = "SELECT id_stage, name FROM stage WHERE admin_id_admin = %s;"
	mycursor.execute(sql, val)
	row = mycursor.fetchone()

	items = {}
	stage = []
	while row is not None:
		id_stage = {}
		id_stage["id"] = row[0]
		id_stage["name"] = row[1]
		stage.append(id_stage)
		row = mycursor.fetchone()

	items["items"] = stage
	return jsonify(items), 200

@app.route("/getStage", methods=['GET'])
def GetStage():
	mydb = mysql.connector.connect(**config)
	mycursor = mydb.cursor(buffered=True)
	id_admin = request.args.get('id_admin')

	val = (id_admin,)
	#mycursor.callproc('buscarStage', val)

	sql = "SELECT id_stage FROM stage WHERE admin_id_admin = %s"
	mycursor.execute(sql, val)

	row = mycursor.fetchone()
	id_stage = {}
	while row is not None:
		id_stage["id"] = row[0]
		row = mycursor.fetchone()

	return jsonify(id_stage), 200


@app.route("/modifyStage", methods=['GET'])
def ModifyStage():
	mydb = mysql.connector.connect(**config)
	mycursor = mydb.cursor(buffered=True)

	id_stage = request.args.get('id_stage')
	name = request.args.get('name')

	sql = "UPDATE stage SET name = %s WHERE id_stage = %s"
	val = (name, id_stage)
	mycursor.execute(sql, val)

	mydb.commit()
	return "", 200

@app.route("/showAllStage", methods=['GET'])
def ShowAllStage():

	mydb = mysql.connector.connect(**config)
	mycursor = mydb.cursor(buffered=True)

	sql = "SELECT * FROM stage WHERE status = '1'"
	mycursor.execute(sql)
	row = mycursor.fetchone()
	
	items = {}
	stage = []
	while row is not None:
		id_stage = {}
		id_stage["id"] = row[0]
		id_stage["name"] = row[1]
		stage.append(id_stage)
		row = mycursor.fetchone()

	items["items"] = stage
	return jsonify(items), 200

@app.route("/stageCountDevices", methods=['GET'])
def StageCountDevices():
	mydb = mysql.connector.connect(**config)
	mycursor = mydb.cursor(buffered=True)
	stage_id_stage = request.args.get('stage_id_stage')

	val = (stage_id_stage,)
	#mycursor.callproc('buscarStage', val)

	sql = "SELECT count(*) FROM device d JOIN room r ON d.room_id_room = r.id_room AND d.status=1 JOIN stage s ON r.stage_id_stage = s.id_stage AND s.id_stage = %s"
	mycursor.execute(sql, val)

	row = mycursor.fetchone()
	items = {}
	stage = []

	while row is not None:
		id_stage = {}
		id_stage["devices"] = row[0]
		stage.append(id_stage)
		row = mycursor.fetchone()

	items["items"] = stage
	return jsonify(items), 200

@app.route("/stageCountUsers", methods=['GET'])
def StageCountUsers():
	mydb = mysql.connector.connect(**config)
	mycursor = mydb.cursor(buffered=True)
	stage_id_stage = request.args.get('stage_id_stage')

	val = (stage_id_stage,)
	#mycursor.callproc('buscarStage', val)

	sql = "SELECT count(*) FROM user_has_stage WHERE stage_id_stage = %s"
	mycursor.execute(sql, val)

	row = mycursor.fetchone()
	items = {}
	stage = []

	while row is not None:
		id_stage = {}
		id_stage["users"] = row[0]
		stage.append(id_stage)
		row = mycursor.fetchone()

	items["things"] = stage
	return jsonify(items), 200

#############################  ROOM   #################################

@app.route("/insertRoom", methods=['GET'])
def InsertRoom():
	mydb = mysql.connector.connect(**config)

	mycursor = mydb.cursor()
	name = request.args.get('name')
	id_scenario = request.args.get('id_scenario')
	id_stage = request.args.get('id_stage')

	try:
		sql = "INSERT INTO room (name, status, scenario_id_scenario, stage_id_stage) VALUES (%s,1,%s,%s)"
		val = (name, id_scenario, id_stage)
		mycursor.execute(sql, val)
	except mysql.connector.IntegrityError:
		return "409"
	
	print("entro a insert")
	mydb.commit()
	print(mycursor.rowcount,"record inserted.")
	return "200"


@app.route("/deleteRoom", methods=['GET'])
def DeleteRoom():

	mydb = mysql.connector.connect(**config)
	mycursor = mydb.cursor()
	id_room = request.args.get('id_room')

	sql = "UPDATE room SET status = 0 WHERE id_room = %s"
	val = (id_room,)
	mycursor.execute(sql, val)

	print(mycursor.rowcount,"record deleted.")
	mydb.commit()

	return "."

#Dado un id_room
@app.route("/searchRoom", methods=['GET'])
def SearchRoom():

	mydb = mysql.connector.connect(**config)
	mycursor = mydb.cursor(buffered=True)
	id_stage = request.args.get('id_stage')

	val = (id_stage,)
	#mycursor.callproc('buscarStage', val)

	sql = "SELECT * FROM room WHERE stage_id_stage = %s AND status=1;"
	mycursor.execute(sql, val)

	row = mycursor.fetchone()
	items = {}
	room = []
	while row is not None:
		id_room = {}
		id_room["id"] = row[0]
		id_room["name"] = row[1]
		room.append(id_room)
		row = mycursor.fetchone()

	items["items"] = room
	return jsonify(items), 200



@app.route("/modifyRoom", methods=['GET'])
def ModifyRoom():
	mydb = mysql.connector.connect(**config)
	mycursor = mydb.cursor(buffered=True)

	id_room = request.args.get('id_room')
	name = request.args.get('name')
	id_scenario = request.args.get('id_scenario')

	sql = "UPDATE room SET name = %s, scenario_id_scenario = %s WHERE id_room = %s"
	val = (name, id_scenario, id_room)
	mycursor.execute(sql, val)

	mydb.commit()
	return "", 200

@app.route("/showAllRoom", methods=['GET'])
def ShowAllRoom():

	mydb = mysql.connector.connect(**config)
	mycursor = mydb.cursor(buffered=True)

	#mycursor.callproc('showUser')
	sql = "SELECT * FROM room WHERE status = 1"
	mycursor.execute(sql)
	
	row = mycursor.fetchone()
	print(mycursor.rowcount,"record inserted.")
	items = {}
	room = []
	while row is not None:
		id_room = {}
		id_room["id"] = row[0]
		id_room["name"] = row[1]
		id_room["type"] = row[2]
		room.append(id_room)
		row = mycursor.fetchone()

	items["items"] = room
	return jsonify(items), 200

@app.route("/countDevices", methods=['GET'])
def CountDevices():
	mydb = mysql.connector.connect(**config)
	mycursor = mydb.cursor(buffered=True)
	id_room = request.args.get('id_room')

	val = (id_room,)
	#mycursor.callproc('buscarStage', val)

	sql = "SELECT count(*) FROM device WHERE room_id_room = %s AND status = 1"
	mycursor.execute(sql, val)

	row = mycursor.fetchone()
	items = {}
	room = []

	while row is not None:
		id_room = {}
		id_room["devices"] = row[0]
		room.append(id_room)
		row = mycursor.fetchone()

	items["items"] = room
	return jsonify(items), 200

@app.route("/checkRoom", methods=['GET'])
def CheckRoom():

	mydb = mysql.connector.connect(**config)
	mycursor = mydb.cursor(buffered=True)
	name_room = request.args.get('name_room')

	val = (name_room,)
	#mycursor.callproc('buscarStage', val)

	sql = "SELECT name FROM room WHERE name = %s AND status=1;"
	mycursor.execute(sql, val)

	row = mycursor.fetchone()
	
	while row is not None:
		id_device = {}
		id_device["name"] = row[0]
		row = mycursor.fetchone()

	return jsonify(id_device), 200


@app.route("/getNameRoom", methods=['GET'])
def GetNameRoom():
	mydb = mysql.connector.connect(**config)
	mycursor = mydb.cursor(buffered=True)
	id_room = request.args.get('id_room')

	val = (id_room,)
	#mycursor.callproc('buscarStage', val)

	sql = "SELECT name FROM room WHERE id_room = %s"
	mycursor.execute(sql, val)

	row = mycursor.fetchone()
	while row is not None:
		id_room = {}
		id_room["name"] = row[0]
		row = mycursor.fetchone()

	return jsonify(id_room), 200

############################
#                          #
#      DISPOSITIVOS        #
#                          #       
############################

@app.route("/insertDevice", methods=['GET'])
def InsertProduct():
	mydb = mysql.connector.connect(**config)

	mycursor = mydb.cursor()
	name_device = request.args.get('name_device')
	type_idtype = request.args.get('type_idtype')
	id_room = request.args.get('id_room')
	status = '1'

	try:
		sql = "INSERT INTO device (name_device, status, type_idtype, room_id_room) VALUES (%s,%s,%s,%s)"
		val = (name_device, status, type_idtype, id_room)
		mycursor.execute(sql, val)
	except mysql.connector.IntegrityError:
		return "409"

		
	print("entro a insert")
	mydb.commit()
	print(mycursor.rowcount,"record inserted.")
	return "200"


@app.route("/deleteDevice", methods=['GET'])
def DeleteDevice():

	mydb = mysql.connector.connect(**config)
	mycursor = mydb.cursor()
	id_device = request.args.get('id_device')

	sql = "UPDATE device SET status = %s WHERE id_device = %s"
	val = (0, id_device)
	mycursor.execute(sql, val)

	print(mycursor.rowcount,"record deleted.")
	mydb.commit()

	return "."

#Dado un id_device
@app.route("/searchDevice", methods=['GET'])
def SearchDevice():

	mydb = mysql.connector.connect(**config)
	mycursor = mydb.cursor(buffered=True)
	name_device = request.args.get('name_device')
	id_room = request.args.get('id_room')

	val = (name_device, id_room)
	sql = "SELECT * FROM device WHERE name_device = %s AND room_id_room = %s;"
	mycursor.execute(sql, val)
	row = mycursor.fetchone()

	while row is not None:
		return '', 400

	return '', 200
	


@app.route("/modifyDevice", methods=['GET'])
def ModifyDevice():
	mydb = mysql.connector.connect(**config)
	mycursor = mydb.cursor(buffered=True)

	id_device = request.args.get('id_device')
	brand = request.args.get('brand')
	model = request.args.get('model')
	#time_register = request.args.get('time_register')
	x = request.args.get('x')
	y = request.args.get('y')

	sql = "UPDATE device SET brand = %s, model = %s, x = %s, y = %s WHERE id_device = %s"
	val = (brand, model, x, y, id_device)
	mycursor.execute(sql, val)

	mydb.commit()
	return "", 200

@app.route("/showAllDevice", methods=['GET'])
def ShowAllDevice():

	mydb = mysql.connector.connect(**config)
	mycursor = mydb.cursor(buffered=True)

	id_room = request.args.get('id_room')
	val = (id_room,)
	sql = "SELECT * FROM device WHERE status = 1 AND room_id_room = %s"
	mycursor.execute(sql,val)
	
	row = mycursor.fetchone()
	items = {}
	device = []
	while row is not None:
		id_device = {}
		id_device["id"] = row[0]
		id_device["name"] = row[1]
		id_device["type"] = row[3]
		device.append(id_device)
		row = mycursor.fetchone()

	items["items"] = device
	return jsonify(items), 200

@app.route('/devices', methods=['GET'])
def deviceIndex():
	mydb = mysql.connector.connect(**config)
	mycursor = mydb.cursor(buffered=True)

	sql = 'SELECT * FROM device,room where device.status=1 and room_id_room=id_room'
	mycursor.execute(sql)

	row = mycursor.fetchone()
	items = {}
	device = []
	while row is not None:
		id_device = {}
		id_device['id'] = row[0]
		id_device['name'] = row[1]
		id_device['type'] = row[3]
		id_device['room_id'] = row[5]
		id_device['room'] = row[6]
		device.append(id_device)
		row = mycursor.fetchone()

	items['items'] = device
	return jsonify(items), 200

#################################
#                               #
#      TIPO DE DISPOSITIVO      #
#                               #       
#################################
@app.route("/checkType", methods=['GET'])
def CheckType():

	mydb = mysql.connector.connect(**config)
	mycursor = mydb.cursor(buffered=True)
	id_type = request.args.get('id_type')

	val = (id_type,)
	#mycursor.callproc('buscarStage', val)

	sql = "SELECT name_type FROM type WHERE id_type = %s;"
	mycursor.execute(sql, val)

	row = mycursor.fetchone()
	type_device = {}
	if row is not None:
		type_device["type"] = row[0]

	
	return jsonify(type_device)
