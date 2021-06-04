import getopt
import sys
import ast
import json
import formatingDataSetProximity as formating
import enumerateTrackersProximity as et
import distancesProximity as distances
import visualisationProximity as vis

def main():
	# intimate, personal, social, public
	#personal validate distances (0.46-1.2m)
	proxemic='personal';
	folderData='/Users/13371327/Documents/Gloria/2020/RulesApp/obs-rules/server/routes/localisation/data';
	roles = {};
	centeredRole='';
	A= json.loads(str(sys.argv[1]));
	B= json.loads(str(sys.argv[2]));
	C= json.loads(str(sys.argv[3]));

	# GETTING PARAMETERS FROM NODE
	#ID rule
	idRule = A[0]['id']
	#TYPE OF GRAPH
	typeOfGraph = A[0]['value_of_mag'];
	if typeOfGraph == 'All':
		typeOfGraph='full';
	else:
		typeOfGraph='role-centered';
	#PHASES
	phase1=B[0]['time_action']
	phase2=B[1]['time_action']
	#CENTERED ROLE
	if typeOfGraph == 'role-centered':
		centeredRole= A[0]['value_of_mag'];
	# ROLES
	for x in range(len(C)):
		roles[x] = C[x]['name']+','+ C[x]['serial'];

	# WHICH SESSION
	session = A[0]['id_session'];
	file = folderData + '/' + str(session) + '.json';
	#print(A, B, str(sys.argv[3]));
	#print(typeOfGraph, phase1, phase2, centeredRole, len(C), roles, session);

	# Reminder: to know who the patient is, use the roles dictionary
	#print(typeOfGraph, phase1, phase2, centeredRole, len(C), roles, session);
	initAnalisis(file, centeredRole, proxemic, phase1, phase2, roles, typeOfGraph, session, idRule);


def initAnalisis(file, centeredRole, proxemic, phase1, phase2, roles, typeOfGraph, session, idRule):
	#READ DATA
	df = formating.readingDataJson(file,session);
	#print(df.head(5));
	#FORMATING
	session = session;

	#FILTER DATA ACCORDING TO PHASES
	df1= formating.nameTrackers(df, roles)
	#print(df.loc[df['tracker'] == 26689])

	#GET NUMBER OF TRACKERS
	n = et.numberTrackers(df)
	#print ('number of trackers', n)
	#print (roles)
	#print ('BEFORE FILTERING: ',len(df.index))
	#FILTERING PER PHASE
	#df = formating.asign_phases(df, phase1, phase2)
	df, toSend = formating.filteringPhases(df1, phase1, phase2)
	if df.empty:
		#print('No matching rows: ', toSend);
		df, toSend= formating.filteringPhasesAdding(df1, phase1, phase2)
		#print(df, toSend)
	# Call the function that enumerates trackers
	df_trackers = et.enumerate_trackers(df)
	df = et.asignEnumTrackers(df, df_trackers)
	# WHICH  TRACKER IS THE SELECTED ROLE
	centeredRole = formating.roleNum(df, df_trackers, centeredRole)
	## DISTANCES
	# To run the calculation of distances it requires the number of trackers and the datase
	df_distancesBetTrackers = distances.distancesBetweenTrackers(df, n)
	#print(df_distancesBetTrackers.head(10))

	# The next steep is to asign proxemic labels according to the distances
	df_proxemic_labels, prox_labels = distances.proxemicsLabels(df_distancesBetTrackers, n)
	#print(df_proxemic_labels, prox_labels)
	# Agregate the proxemic labels per session
	df = vis.aggregateLabels(df_proxemic_labels, prox_labels)
	#print(df.head(5))

	if (typeOfGraph == 'full'):
		# trackers_names = vis.nameTrackers(df, listRoles)
		trackers_names = vis.nameTrackers(df_trackers, roles)

		filterProxemic = vis.filterPL(df, proxemic, role=0)
		graph = vis.generateFullGraph(filterProxemic, trackers_names)
		vis.visualiseGraph1(graph, session, 'porcentages', proxemic, idRule)

		# Indicators of centrality
		print('GRAPH DEGREE: ', vis.graphDegree(graph))
		print('VERTEX 1 DEGREE: ', vis.vertexDegree(1, graph))
		print('EDGE DEGREE: ', vis.edgeBetweennes(graph))
		print('VERTEX DEGREE: ', vis.vertexBetweennes(graph))
		print('LARGEST BETWEENESS: ', vis.largestBetweeness(graph, 'tracker'))
		print('PAGE RANK: ', vis.pageRabk(graph))
		print('PERSONALISE PAGE RANK: ', vis.PpageRabk(graph, 'proxLabel'))
	else:
		#print('ready to print the graph: centered role: ' +str(centeredRole))
		# Filtering data according to proxemic label of interest and the role

		filterProxemic = vis.filterPL(df, proxemic, centeredRole)
		#print(filterProxemic)

		# Once we have the proxemic labels we can try to plot the SN
		df_trackers_ordered = vis.orderTrackers(centeredRole, df_trackers)
		trackers_names = vis.nameTrackers(df_trackers_ordered, roles)
		#print('NAME  TRACKERS: @@@@ ',trackers_names)
		#print('ORDERED TRACKERS: @@@@ ', df_trackers_ordered)
		#graph = vis.graphDefinition(filterProxemic, trackers_names, 'numbers')

		# VISUALISE
		#vis.visualiseGraph(graph)
		# vis.visualiseGraph1(graph, session, phase, 'numbers', proxemic)

		# visualise normalized data and porcentages

		dfnorm = vis.normalizedata(filterProxemic)
		graph = vis.graphDefinition(dfnorm, trackers_names, 'porcentages')
		#print(graph)
		vis.visualiseGraph1(graph, session, 'porcentages', proxemic, idRule)

if __name__ == "__main__":
    # execute only if run as a script
    main()



