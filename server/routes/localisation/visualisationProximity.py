from igraph import *
import pandas as pd
from matplotlib import pyplot as plt
#import cairo
import formatingDataSetProximity as fd
import numpy as np
import os
#import shutil

#parameters: data frames with PL to aggregate how many seconds do we have per Label
#return: this function returns a new dataset with the count of the aggregated values per label


def aggregateLabels(df, prox_columns):
    df3 = pd.DataFrame({'proxemic': ['False', 'personal', 'intimate', 'social', 'public']})
    for x in prox_columns:
        df1 = df.groupby([x]).count()[['timestamp']]
        lista = (list(df1.index.values))
        values = []
        for item in df3['proxemic']:
            if item in lista:
                value = df1['timestamp'][item]
                values.append(value)
            else:
                value = '0'
                values.append(value)
        df3[x] = values

    # decide what to do with the missed data!!
    # I am deleting the missing data which is the False values
    df3 = df3.query('proxemic != "False"')
    return df3

#when the dataset has different phases this function agregate the laberls per phase
#parameters: dataset with labels and phases columns
#return: a totally new dataset with the aggregation of PL per Phase
def aggregateLaberlsPhase(df):
    return df

# when the analysis want to be focussed on an specific proxemic label
#parameters:  df with labels, string that indicated the proxemicLabel we want to filter
#return: a new data set with the values according to the proxec label
def filterPL(df, proxemicLabel, role):
    if (role == 0):
        df = df[df['proxemic'] == proxemicLabel]
        role = 'PL_'
        spike_cols = [col for col in df.columns if role in col]
        df = df[spike_cols]
    else:
        #Filtering the proxemic label
        #role
        role = '_'+str(role)
        df= df[df['proxemic']== proxemicLabel]
        #Filtering the roles
        spike_cols = [col for col in df.columns if role in col]
        #print(list(df.columns))
        #print(spike_cols)
        df= df[spike_cols]
        #df = df.query('proxemic == '+proxemicLabel)
    return df

def orderTrackers(role, df_trackers):
    index = int(role)
    # Order the vertices... Role should be the first one.
    df_shifted=pd.concat([df_trackers.iloc[[index-1], :], df_trackers.drop(index-1, axis=0)], axis=0)
    df_shifted.reset_index(level=0, inplace=True)
    return df_shifted

#def nameTrackers(df, listRoles):
#    df["Role"] = df["enumeration"].apply(lambda x: listRoles.get(x).split(',')[0])
#    return df

def nameTrackers(df, listRoles):
    #value=listRoles.get(0)
    #print('Roles: @@@@@@ ', value)
    #x = value.split(",")
    for x in range(0, len(listRoles)):
        serial=int(listRoles.get(x).split(',')[1])
        role=listRoles.get(x).split(',')[0]
        df.loc[df['tracker'] == serial, 'Role'] = role
    return df

def graphDefinition(df, df_trackers, typ):
    #print('######################## THIS IS WHAT WE HAVE')
    #print (df_trackers)
    roles =''
    values=''
    #vertices = df_trackers[['tracker', 'enumeration']]
    vertices = df_trackers.Role.unique()
    #print(type(vertices));
    #g = ig.Graph()
    # Defining edges, it can be generate automatically according to the number of trackers
    # SNA.. This is the actual Social Network, we need to think how to explote this for our dataset
    g = Graph([(0, 1), (0, 2), (0, 3), (0, 4), (0, 5)])

    # if(len(df_trackers.tracker.unique()) == 6):
    #     g = Graph([(0,1), (0,2), (0,3), (0,4), (0,5)])
    # if (len(df_trackers.tracker.unique()) == 5):
    #     g = Graph([(0, 1), (0, 2), (0, 3), (0, 4)])
    # else:
    #     print('The SN need to be define here')
    # To fill the value of vertices
    i=0
    for item in vertices:
        g.vs[i]['tracker'] = str(item)
        #print('tracker: ',  str(i) , ' ' , g.vs[i]['tracker'])
        roles +=  g.vs[i]['tracker'] + ', '
        i+=1

    #print (df)
    # To fill the name of edges
    # g.es['proxLabel'] = ["0", "6", "0", "0", "0", "0"]
    j = 0
    for item in df:
        g.es[j]['proxLabel'] = str(df.iloc[0][item])
        #print('proxLabel: ', str(j), '  ', g.es[j]['proxLabel'])
        values +=g.es[j]['proxLabel'] + ', '
        j += 1

    if (typ=='porcentages'):
        j = 0
        for item in df:
            # if (float(df.iloc[0][item])==0.0):
            #     g.es[j]['width'] = 0.1 * 5
            # else:
            #     g.es[j]['width'] = float(df.iloc[0][item]) * 4
            g.es[j]['width'] = float(df.iloc[0][item]) * 4
            j += 1
    else:
        j = 0
        for item in df:
            if (int(df.iloc[0][item])==0):
                g.es[j]['width'] = 0.1 * 5
            else:
                g.es[j]['width'] = int(df.iloc[0][item])*0.05
            j += 1

    #summary(g)
    #for int
    #print(values, roles)
    values = values.split(',')
    roles = roles.split(', ')
    values.insert(0, 'center')
    #print(values, roles)
    #print(len(values), len(roles))
    message=''
    color =''
    for i in range(0, len(values)-1):
        color = ''
        if i>0:
            if float(values[i]) < 0.5:
                color='<span class="message-graph-negative"> '
            else:
                color= '<span class="message-graph-possitive"> '
            message += ' '+roles[i] + ' spent ' + color + values[i] + '%'+' </span>'+ 'of their time with ' +roles[0] +' \n'
    return g, message

def visualiseGraph(g, session, phase, type, proxemic):
    name= str(session)+'_'+phase+'_'+type+'_'+proxemic+'.png'
    layout = g.layout("kk")
    #print (g.vs['tracker'])
    #print(g.es['proxLabel'])
    g.vs['label'] = g.vs['tracker']
    g.es['label'] = g.es['proxLabel']
    g.vs['color'] = 'light blue'
    g.es["color"] = ["pink" if float(proxLabel) < 0.5 else "blue" for proxLabel in g.es["proxLabel"]]
    visual_style = {}
    visual_style["vertex_size"] = 20
    visual_style["vertex_label_dist"] = 1
    visual_style["vertex_label_angle"] = 3
    visual_style["layout"] = layout
    visual_style["bbox"] = (400, 400)
    visual_style["margin"] = 30
    visual_style["vertex_label_angle"] = 0
    plot(g, name, **visual_style)

def visualiseGraph1(g, session, type, proxemic, idRule):
    name=str(session)+'_'+str(idRule)+'_'+type+'_'+proxemic+'.png'
    layout = g.layout("kk")
    #print (g.vs['tracker'])
    #print(g.es['proxLabel'])
    g.vs['label'] = g.vs['tracker']
    g.es['label'] = g.es['proxLabel']
    g.vs['color'] = 'light blue'
    g.es["color"] = ["pink" if float(proxLabel) < 0.5 else "blue" for proxLabel in g.es["proxLabel"]]
    #g.es["edge_width"] = [10 if float(proxLabel) < 0.5 else 50 for proxLabel in g.es["proxLabel"]]
    #g.es['width'] = [float(x) * 5 if float(x) != 0.0 else 0.1 * 5 for x in g.es["proxLabel"]]
    visual_style = {}
    visual_style["vertex_size"] = 20
    visual_style["vertex_label_dist"] = 1
    visual_style["vertex_label_angle"] = 3
    visual_style["layout"] = layout
    visual_style["bbox"] = (400, 400)
    visual_style["margin"] = 30
    visual_style["vertex_label_angle"] = 0
    out = plot(g, name, **visual_style)
    actualDir = os.getcwd()
    out.save(actualDir+'/client/data/graphs/'+name)
    #path = os.path.abspath(name)
    #directory = os.path.dirname(path)
    #shutil.move(directory+'/'+name, actualDir+'/dataLocalisation/')
    return name

# requiere ordered aggregation of values per phase
def normalizedata(df_labels):
    array_filtered = df_labels.to_numpy()[0]

    #maximo = numpy.amax(int(array_filtered))
    minimo = np.min(array_filtered.astype(np.int32))
    #minimo = np.min(array_filtered)
    #print ('###MINIMOOOO',array_filtered, minimo)
    maximo = np.max(array_filtered.astype(np.int32))
    #maximo = np.max(array_filtered)
    #print(maximo)

    #print(array_filtered, minimo)
    #print(len(array_filtered))
    values = []
    if (minimo == maximo):
        values = [minimo, minimo, minimo, minimo, minimo]
    else:
        #print('they are different @@@@@@')
        for x in range(0, len(array_filtered)):
            y = (((int(array_filtered[x]))-float(minimo)) / (float(maximo - minimo)))
            #print('value  ',y, type(y), (int(array_filtered[x])))
            values.append(round(y,2))
    #print ('NORMALISED DATA: ',values)
    df_labels.loc[0] = values
    df_labels = df_labels.iloc[1:]
    #print ('NORMALISE DATASET: ',df_labels)
    return df_labels

# requiere ordered aggregation of values per phase
def normalizedataTotalSeconds(df_labels, totalSeconds):
    array_filtered = df_labels.to_numpy()[0]

    #maximo = numpy.amax(int(array_filtered))
    minimo = np.min(array_filtered.astype(np.int32))
    #minimo = np.min(array_filtered)
    #print ('###MINIMOOOO',array_filtered, minimo)
    maximo =totalSeconds;
    #maximo = np.max(array_filtered.astype(np.int32))
    #maximo = np.max(array_filtered)
    #print(maximo)

    #print(array_filtered, minimo)
    #print(len(array_filtered))
    values = []
    if (minimo == maximo):
        values = [minimo, minimo, minimo, minimo, minimo]
    else:
        #print('they are different @@@@@@')
        for x in range(0, len(array_filtered)):
            y = (((int(array_filtered[x]))-float(minimo)) / (float(maximo - minimo)))
            #print('value  ',y, type(y), (int(array_filtered[x])))
            values.append(round(y,2))
    #print ('NORMALISED DATA: ',values)
    df_labels.loc[0] = values
    df_labels = df_labels.iloc[1:]
    #print ('NORMALISE DATASET: ',df_labels)
    return df_labels

def generateFullGraph(df, df_trackers):
    df = normalizedata(df)
    g = fullGraphDefinition(df, df_trackers)
    return g

def fullGraphDefinition(df, df_trackers):
    print('######################## FULL GRAPH DEFINITION')
    # Use the enumeration to generate values
    print (df_trackers)
    #vertices = df_trackers[['tracker', 'enumeration']]
    vertices = df_trackers.Role.unique()
    #g = ig.Graph()
    #vertices = ['Nurse 1', 'Doctor', 'Nurse 2', 'Nurse 3', 'Team-Leader', 'Patient']
    # Defining edges, it can be generate automatically according to the number of trackers
    # SNA.. This is the actual Social Network, we need to think how to explote this for our dataset
    value = ''
    items =[]
    print ('VERTICES ', vertices)
    for x in range(0, len(vertices)):
        for i in range(x + 1, len(vertices)):
            value = (x, i)
            #value = '(' + str(x) + ', ' + str(i)+')'
            items.append(value)
    l = list()
    for item in items:
        l.append(item)

    print (tuple(l))
    g = Graph()
    g.add_vertices(len(df_trackers))
    g.add_edges(tuple(l))

    summary(g)

    #Asign names to vertices
    i=0
    for item in vertices:
        g.vs[i]['tracker'] = str(item)
        i+=1

    print (df)
    # # To fill the name of edges

    #Asign numbers to the edges, the proxemic porcentage
    j = 0
    for item in df:
        #Asign the proxemic label value to the edges, the porcentage
        g.es[j]['proxLabel'] = str(df.iloc[0][item])
        # indicated the with of each edge
        if (float(df.iloc[0][item]) == 0.0):
            g.es[j]['width'] = 0.1 * 5
        else:
            g.es[j]['width'] = float(df.iloc[0][item]) * 4
        j += 1

    summary(g)
    return g

# The degree of a vertex equals the number of edges adjacent to it.
def graphDegree(g):
    degree=g.degree()
    return degree

# The degree of a vertex equals the number of edges adjacent to it.
# You can also pass a single vertex ID or a list of vertex IDs to degree()
def vertexDegree(vertex, g):
    vertexDegree=g.degree(vertex)
    return vertexDegree

#vertex betweenness
def vertexBetweennes(g):
    return g.betweenness()

#edge betweenness
def edgeBetweennes(g):
    return g.edge_betweenness()

#highest edge betweenness centrality
def HedgeBetweennes(g):
    ebs= g.edge_betweenness()
    return max(ebs)

# Who has the largest degree or betweenness centrality
def largestBetweeness(g, name):
    who = g.vs.select(_degree=g.maxdegree())[name]
    return who

#pagerank
def pageRabk(g):
    return g.pagerank()

#personalize pagerank
def PpageRabk(g, weight):
    return g.personalized_pagerank(weights=weight, implementation="prpack")