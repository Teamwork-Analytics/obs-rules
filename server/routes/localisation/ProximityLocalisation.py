#import getopt
import sys
#import ast
import json
import formatingDataSetProximity as formating
import enumerateTrackersProximity as et
import distancesProximity as distances
import visualisationProximity as vis
from datetime import datetime
from time import gmtime, strftime
import pandas as pd

def main():
	# intimate, personal, social, public
	#personal validate distances (0.46-1.2m)
	proxemic='intimate'
	proxemic2='intimate'
	patientIDDevice=''
	#folderData='/Users/13371327/Documents/Gloria/2020/RulesApp/obs-rules/server/routes/localisation/data';
	folderData = 'server/routes/localisation/data'
	#print(folderData);
	roles = {}
	coordinates={}
	centeredRole=''
	A= json.loads(str(sys.argv[1]))
	B= json.loads(str(sys.argv[2]))
	C= json.loads(str(sys.argv[3]))

	# GETTING PARAMETERS FROM NODE
	#ID rule
	idRule = A[0]['id']
	#TYPE OF GRAPH
	typeOfGraph = A[0]['value_of_mag']
	spetialSim=''

	if typeOfGraph == 'Priority':
		spetialSim='barchar'
	if typeOfGraph == 'All':
		typeOfGraph='full'
	else:
		typeOfGraph='role-centered'

	#PHASES
	myFormat = '%Y-%m-%d %I:%M:%S'
	phase1 = B[0]['time_action']
	phase2 = B[1]['time_action']

	#print('dates in the python script: ', phase1, phase2)
	#phase1 = datetime.strptime(phase1.split('.')[0], myFormat)


	#phase2 = datetime.strptime(phase2.split('.')[0], myFormat)

	#print('dates in the python script AFTER : ', phase1, phase2)
	#CENTERED ROLE
	if typeOfGraph == 'role-centered':
		#print('The value of the center role: ', A[0]['value_of_mag'])
		if(A[0]['value_of_mag'] is None or A[0]['value_of_mag']== '' or A[0]['value_of_mag']== 'null'):
			centeredRole='11111'
		else:
			centeredRole= A[0]['value_of_mag']
	else:
		centeredRole=0

	# ROLES
	#print('centeredRole value: ', centeredRole)
	#7 is the patient role according to the web tool
	for x in range(len(C)):
		if (C[x]['id_object']) == 7:
			patientIDDevice = C[x]['serial']
			patientcoordinates = C[x]['coordinates']
			if(centeredRole=='11111'):
				roles[x] = C[x]['name'] + ',' + '11111'
			else:
				roles[x] = C[x]['name'] + ',' + '11111'
			#print('Here is the patient information: ',patientIDDevice, patientcoordinates, roles[x])
		else:
			roles[x] = C[x]['name'] + ',' + C[x]['serial']
		#print(roles[x])
	#print('After the loop: ',patientIDDevice)
	# WHICH SESSION
	session = A[0]['id_session']
	file = folderData + '/' + str(session) + '.json'
	#print(A, B, str(sys.argv[3]));
	#print(typeOfGraph, phase1, phase2, centeredRole, len(C), roles, session);

	# Reminder: to know who the patient is, use the roles dictionary
	#print(typeOfGraph, phase1, phase2, centeredRole, len(C), roles, session);
	if(spetialSim=='barchar'):
		#print('Here we are about to generate a barchar')
		D = json.loads(str(sys.argv[4]))
		#COORDINATES
		for x in range(len(D)):
			coordinates[x] = D[x]['coordinates']
		#print('This is the first group of coordinates: ', D[0]["coordinates"], D[0]["name"])

		createBarChar(file, session, coordinates,proxemic, phase1, phase2, idRule, patientIDDevice)
	else:
		initAnalisis(file, centeredRole, proxemic, proxemic2, phase1, phase2, roles, typeOfGraph, session, idRule, patientIDDevice, patientcoordinates)

def initAnalisis(file, centeredRole, proxemic,proxemic2, phase1, phase2, roles, typeOfGraph, session, idRule, patientIDDevice, patientcoordinates):
	#READ DATA
	df = formating.readingDataJson(file,session)
	#print('Alll the variables I want to know: ',centeredRole, patientcoordinates, patientIDDevice);

	if ((not(patientIDDevice is None)) & (patientIDDevice != '')) & (typeOfGraph=='full'):
		query = 'tracker !=' + patientIDDevice
		df = df.query(query)

	if (typeOfGraph=='role-centered'):
		# Add the patient info into the dataFrame
		if(not(patientcoordinates is None)) & (centeredRole=='11111'):
			#create a small dataFrame with the patient info
			#the tagId is 0000
			#print('Good the patient coordinate and the centered role is patient', centeredRole, patientcoordinates)
			start = df['timestamp'].iloc[0]
			# last value
			end = df['timestamp'].iloc[-1]
			dfPatient= formating.creatingTimestampColumns(start, end, patientcoordinates, session)

			#Concat the new dataFrame with the one that was read in the first line

			frames = [dfPatient, df]
			df = pd.concat(frames, sort=True)
			df = df.reset_index()
			#print(df);
		elif (patientcoordinates is None):
			response = {"message": 'none', "path": 'none', "messageError": 'Please set the patient coordinate or the role serial tracker'}
			json_RESPONSE = json.dumps(response)
			print(json_RESPONSE)

	#FORMATING
	#session = session;

	#FILTER DATA ACCORDING TO PHASES
	df1= formating.nameTrackers(df, roles)
	#print(df.loc[df['tracker'] == 26689])
	#print(df1.Role.unique())
	#print(df1)

	#GET NUMBER OF TRACKERS
	n = et.numberTrackers(df1)
	#print ('number of trackers', n)
	#print (roles)
	#print ('BEFORE FILTERING: ',len(df.index))
	#FILTERING PER PHASE
	#df = formating.asign_phases(df, phase1, phase2)
	df, toSend = formating.filteringPhases(df1, phase1, phase2)
	#Total of seconds

	#print('This is the data number of rows: ',len(df.index))
	totalSeconds = len(df.index)
	if df.empty:
		#print('No matching rows: ', toSend);
		df, toSend= formating.filteringPhasesAdding(df1, phase1, phase2)
		if df.empty:
			df, toSend = formating.filteringPhasesMinosTimeZone(df1, phase1, phase2)
	#print(toSend)
	#print(df, toSend)
	#print('This is the data filtered dataframe: ',df.Role.unique(), df)

	# Call the function that enumerates trackers
	df_trackers = et.enumerate_trackers(df)
	#print('df_trackers: $$$$$',df_trackers)
	df = et.asignEnumTrackers(df, df_trackers)
	#print('Assign enum trackers: $$$$$',df)
	# HERE I NEED TO KNOW HOW MANY SECONDS THIS SECTION OF THE SIMULATION LAST

	#print ('AFTER FILTERING: ',len(df.index))

	# WHICH  TRACKER IS THE SELECTED ROLE, returns the enum tracker
	#print('Here is the center role value: ',centeredRole)
	centeredRole = formating.roleNum(df, df_trackers, centeredRole)
	#print('Enum for the selected role in the miedle: $$$$$', centeredRole)
	## DISTANCES
	# To run the calculation of distances it requires the number of trackers and the dataset
	df_distancesBetTrackers = distances.distancesBetweenTrackers(df, n)
	#print('Distances between trackers: $$$$$', df_distancesBetTrackers)
	#print(df_distancesBetTrackers.head(10))

	# The next steep is to asign proxemic labels according to the distances
	df_proxemic_labels, prox_labels = distances.proxemicsLabels(df_distancesBetTrackers, n)
	#print('Labels according to the distance: $$$$$', df_proxemic_labels, prox_labels)
	#print(df_proxemic_labels, prox_labels)
	# Agregate the proxemic labels per session
	df = vis.aggregateLabels(df_proxemic_labels, prox_labels)
	#print('Agregation of the proxemic labels', df.head(5))

	if (typeOfGraph == 'full'):
		#print(df.head(10))
		filterProxemic = vis.filterPL(df, proxemic, proxemic2, role=0)
		# trackers_names = vis.nameTrackers(df, listRoles)
		#df_trackers_ordered = vis.orderTrackers(centeredRole, df_trackers)
		trackers_names = vis.nameTrackers(df_trackers, roles)
		#trackers_names = vis.nameTrackers(df_trackers, roles)

		#filterProxemic = vis.filterPL(df, proxemic,proxemic2, role=0)
		graph, message = vis.generateFullGraph(filterProxemic, trackers_names)
		name = vis.visualiseGraph1(graph, session, 'porcentages', proxemic, idRule)
		response = {"message": message, "path": name, "messageError": "none"}
		json_RESPONSE = json.dumps(response)
		print(json_RESPONSE)

		# Indicators of centrality
		#print('GRAPH DEGREE: ', vis.graphDegree(graph))
		#print('VERTEX 1 DEGREE: ', vis.vertexDegree(1, graph))
		#print('EDGE DEGREE: ', vis.edgeBetweennes(graph))
		#print('VERTEX DEGREE: ', vis.vertexBetweennes(graph))
		#print('LARGEST BETWEENESS: ', vis.largestBetweeness(graph, 'tracker'))
		#print('PAGE RANK: ', vis.pageRabk(graph))
		#print('PERSONALISE PAGE RANK: ', vis.PpageRabk(graph, 'proxLabel'))
	else:
		# Filtering data according to proxemic label of interest and the role
		filterProxemic = vis.filterPL(df, proxemic, proxemic2, centeredRole)
		#totalSeconds = len(filterProxemic.index)
		#print('Filter the data according to the proxemic label: ',filterProxemic)
		# Once we have the proxemic labels we can try to plot the SN
		df_trackers_ordered = vis.orderTrackers(centeredRole, df_trackers)
		#print(df_trackers_ordered)
		trackers_names = vis.nameTrackers(df_trackers_ordered, roles)
		#print('NAME  TRACKERS: @@@@ ',trackers_names)
		#print('ORDERED TRACKERS: @@@@ ', df_trackers_ordered)

		# VISUALISE
		# visualise normalized data and porcentages
		dfnorm = vis.normalizedata(filterProxemic)
		#print(dfnorm)
		graph, message = vis.graphDefinition(dfnorm, trackers_names, 'porcentages')
		#print(graph)
		name = vis.visualiseGraph1(graph, session, 'porcentages', proxemic, idRule)
		response =  {"message":message, "path":name, "messageError": "none"}
		json_RESPONSE = json.dumps(response)
		print(json_RESPONSE)

def createBarChar(file, session, coordinates,proxemic, phase1, phase2, idRule, patientIDDevice):
	#Read the file
	df1 = formating.readingDataJson(file, session)
	#Remove the patient' data from the dataFrame, if it was tracked
	#print('Patient ID device', patientIDDevice)
	#print(df.head(10))
	if (patientIDDevice!='') & (not(patientIDDevice is None)):
		query='tracker !=' + patientIDDevice
		df1 = df1.query(query)
	#FilterDataSet
	df, toSend = formating.filteringPhases(df1, phase1, phase2)
	if df.empty:
		# print('No matching rows: ', toSend);
		df, toSend = formating.filteringPhasesAdding(df1, phase1, phase2)
		if df.empty:
			df, toSend = formating.filteringPhasesMinosTimeZone(df1, phase1, phase2)
	#print(toSend)
	print(df.tracker.unique(), toSend, df)

	#print('This is the data number of rows: ',len(df.index))

	#Calculate distancesRolesAndBeds
	df = distances.calculateDistancesRolesToBeds(df, coordinates)
	#Were they in intimate proxemity with the patient asign label?
	numberOfPatients = len(coordinates)
	#print('The number of patients is: ', numberOfPatients);
	# careful with this functions of do you want to validate different distances. works only for intimate and personal
	df = distances.asignProximityLabel(df, numberOfPatients)
	#Agregate values according to the proximity of each patient Create a summary
	# bed 1: %, bed 2: %, bed  3: %
	itemsPlot, message, indexMax=distances.aggregateProximity(df, proxemic, numberOfPatients)
	name = vis.plotBarChart(itemsPlot, session, idRule, indexMax)
	response = {"message": message, "path": name, "messageError": "none"}
	json_RESPONSE = json.dumps(response)
	print(json_RESPONSE)


if __name__ == "__main__":
    # execute only if run as a script
    main()



