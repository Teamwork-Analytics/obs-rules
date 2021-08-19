import pandas as pd
import numpy as np
#import seaborn as sns
import os
#import csv
#import datetime as dt
#from datetime import datatime
import time
import json
import datetime
from datetime import timedelta
from dateutil import parser

def readingData(filename, path, phase, session):
    filename, file_extension = os.path.splitext(path)
    #print (file_extension)
    ## TO DO - Other extensions should be supported
    if(file_extension == '.xlsx' or file_extension == '.xls'):
        session_data = pd.read_excel(path, lines=True)
        df=formatExcel(session_data, session)
    else:
        session_data= pd.read_json(path, lines=True)
        df=formatJson(session_data, session)

    #df[df['tracker'] == 26689]
    #print('@@@@@@@ MEAN',df["x"].mean(), df["y"].mean())
    #print(df["x"].head(50), df["y"].head(50))

    # Delete trackers - I will delete the Patient from my list of trackers

    df = cleaning(df)
    df = deleteRole(df, file_extension)
    df = normalization(df)
    df = addingRoles(df,phase)
    return df

def readingData1(filename, path, phase, session):
    filename, file_extension = os.path.splitext(path)
    print (file_extension)
    ## TO DO - Other extensions should be supported
    if(file_extension == '.xlsx' or file_extension == '.xls'):
        session_data = pd.read_excel(path, lines=True)
        df=formatExcel(session_data, session)
    else:
        session_data= pd.read_json(path, lines=True)
        df=formatJson(session_data, session)
    # Delete trackers - I will delete the Patient from my list of trackers
    df = cleaning(df)
    df = normalization(df)
    return df


def readingDataJson(file, session):
    #print('This is the file path: ',file)
    session_data= pd.read_json(file, lines=True, orient='records')
    #print(session_data.head(10));
    #print('Number of columns: ', len(session_data.columns))
    if(len(session_data.columns)<=1):
        #session_data = pd.read_json(file, lines=True, orient='values')
        session_data=pd.read_json(session_data[0].to_json(), orient='index')
        session_data=session_data.reset_index()
    #print('Number of columns After: ', len(session_data.columns))
    #print(session_data.tagId.unique())
    df=formatJson(session_data, session)
    # Delete trackers - I will delete the Patient from my list of trackers
    df = normalization(df)
    df = cleaning(df)
    #print (df["timestamp"].head(10))

    return df

def formatExcel(df, session):
    print('Here I am')

    df.rename(columns={'TAG ID': 'tracker'}, inplace=True)
    df.rename(columns={'Timestamp': 'timestamp'}, inplace=True)
    df.rename(columns={'avg(x)': 'x'}, inplace=True)
    df.rename(columns={'avg(y)': 'y'}, inplace=True)
    myFormat = "%Y-%m-%d %H:%M:%S"
    df['timestamp'] = df['timestamp'].values.astype('datetime64[s]')
    df['timestamp'] = df['timestamp'].apply(pd.to_datetime, myFormat, errors='ignore')
    df['phase'] = '2'
    df['quartile'] = '2'
    df['session'] = int(session)
    return df

def formatJson(df, session):
    #print(df.tagId.unique())
    #print ('### JSON')
    # 2. Add the session column
    ## TO DO - The session should be part of the file and can be added accordint to the file name
    df['session'] = int(session)

    # 3. Change the name of the column
    df.rename(columns={'tagId': 'tracker'}, inplace=True)

    #for col in data.columns:
    #    if (col == "TAG ID"):
    #        df.rename(columns={'TAG ID': 'tracker'}, inplace=True)
    #    elif(col == "tagId"):
    #        df.rename(columns={'tagId': 'tracker'}, inplace=True)

    # 4. Change numeric value of timestamp to datatime
    #myFormat = '%Y-%m-%d %H:%M:%S'
    myFormat = '%Y-%m-%d %I:%M:%S'
    df['timestamp'] = df['timestamp'].values.astype('datetime64[s]')
    df['timestamp']=df['timestamp'].apply(pd.to_datetime,myFormat, errors='ignore')
    #df['timestamp'] = df['timestamp'].values.astype('datetime64[s]')

    # 5. Remove all rows where success == False
    # df=session_data[session_data.success != 'False']
    df = df.query('success != False')
    df['success'].replace('', np.nan, inplace=True)
    df.dropna(subset=['success'], inplace=True)
    #df = df['success'] != ''
    # print(df['data'].head(10))

    # 6. Extract from data the other values: x, y, z, accX .... etc
    # When it taking so long, segment the dataset
    # df_test = df.head(20)
    # json_tree = objectpath.Tree(df_test['data'])
    x = []; y = []; z = []; aX = []; aY = []; aZ = []; pitch = []; yaw = [];
    roll = []
    #print(df["data"].head(10))
    for item in df['data']:
        #print(item)
        x.append(item.get("coordinates").get("x")); y.append(item.get("coordinates").get("y")); z.append(item.get("coordinates").get("z"))
        #aX.append(item.get("acceleration").get("x")); aY.append(item.get("acceleration").get("y")); aZ.append(item.get("acceleration").get("z"))
        pitch.append(item.get("orientation").get("pitch")); yaw.append(item.get("orientation").get("yaw")); roll.append(item.get("orientation").get("roll"))

    df.insert(0, "x", x, True); df.insert(1, "y", y, True); df.insert(2, "z", z, True)
    #df.insert(3, "accX", aX, True); df.insert(4, "accY", aY, True); df.insert(5, "accZ", aZ, True)
    df.insert(3, "pitch", pitch, True); df.insert(4, "yaw", yaw, True); df.insert(5, "roll", roll, True)
    # session_data.insert(3, "pitch", pitch, True); session_data.insert(4, "yaw", yaw, True); session_data.insert(5, "roll", roll, True)
    #df['phase'] = '2'
    #df['quartile'] = '2'
    #print(df.tracker.unique())
    df = df.sort_values('timestamp')
    df = df.reset_index()
    #print(df["timestamp"])
    return df

#This function should be optimize to generate the phases automatically in the data set
# parameters: the dataset and a reference data set that contains begining_timestamps end_timestamp and phase to map the original data set
# returns: a data frame with the phases asigned
def asignPhases(df, phasesReference):
    df['phase'] = '1'
    df['quartile'] = '1'
    df
    return df

def cleaning(df):
    #df = df[['session', 'timestamp','tracker', 'x', 'y', 'z','pitch','yaw','roll','accX','accY','accZ']]  # Re-order dataframe columns
    df = df[['session', 'timestamp', 'tracker', 'x', 'y']]  # Re-order dataframe columns
    df = df.sort_values(['tracker', 'session', 'timestamp'])  # order session (1 - 12)
    # remove tracker = 1 - VALIDATE IF IT IS NECESSARY TO REMOVE THE PATIENT
    #df = df[df.tracker != 1]
    #print(df.head(10))
    return df

def normalization(df):
    df2 = pd.DataFrame()
    trackers = df.tracker.unique()

    sessions = df.session.unique()

    list_tracker = trackers
    list_session = sessions
    session_tracker = df.groupby(['session', 'tracker']).size().reset_index().rename(columns={0: 'count'})
    #print(session_tracker)

    for index, row_pair in session_tracker.iterrows():
        # GET sub dataframe for a particular tracker
        #print(index, row_pair)
        session_df = df[(df['tracker'] == row_pair['tracker']) & (df['session'] == row_pair['session'])]


        ## Create new dataframe with 60 data points per second for each session using start and end time from classroom dataset
        # get first value in timestamp
        first = session_df['timestamp'].iloc[0]
        # last value
        last = session_df['timestamp'].iloc[-1]
        # create time range for new dataframe
        df_time = pd.date_range(start=first, end=last, freq='S')
        #if (row_pair['tracker'] == 27261):
        #   print(df_time, first, last)
        #print(df_time.to_frame().head(5))


        ## MERGE classroom dataframe to new dataframe with 60 data points
        #session_df['timestamp']=session_df['timestamp'].astype('datetime64')
        session_df = session_df.set_index('timestamp')  # need to index timestamp
        #print(session_df['tracker'].head(100))
        #print((session_df.tracker.unique()))
        #merge = session_df.merge(df_time.to_frame(),left_on='timestamp', how='right')
        merge = pd.merge(df_time.to_frame(), session_df, left_index=True, right_on='timestamp', how='left')

        #if(row_pair['tracker']==27152):
        #    print (merge)
        #print(merge.head(5))

        ## FILL MISSING VALUES - interpolate values
        # forward-fill (using existing values to fill)
        m = merge.copy()
        m[['session', 'tracker']] = m[['session', 'tracker']].ffill()
        # fill x and y using linear interpolation
        m[['x', 'y']] = m[['x', 'y']].interpolate(method='linear', axis=0).ffill().bfill()

        # SAVE
        df2 = df2.append(m)
        #print((df2.tracker.unique()))
    df2 = df2.reset_index()  # remove index (duplicate timestamp values)
    #df2 = df2[['tracker', 'session', 'phase', 'quartile', 'timestamp', 'x', 'y']]  # select required columns
    #print('All good to this point')
    #print(trackers, (df2.tracker.unique()))
    return df2

def phaseI(initial, outtime, x, phase):
    # for x in range(1, numberOfTrackers):
    #     if 0.46 > x >= 0:
    #         df_distancesBetTrackers[column_nameresult] = np.where(	x= 'intimate'
    if initial > x >= outtime:
        return phase

#PROVITIONAL
#this filter is povisional to select specific data from the orificanl data set according to a timestamp rank
def filteringPhases(df, phase1, phase2):
    #myFormatB = '%Y-%m-%d %H:%M:%S'
    #myFormatB = '%Y-%m-%d %I:%M:%S.%f'
    myFormatB = '%Y-%m-%d %I:%M:%S'
    phase1= pd.to_datetime(phase1.split(".")[0])
    phase2 = pd.to_datetime(phase2.split(".")[0])

    #phase1= phase1.split(".")
    #phase2 = phase2.split(".")
    #print(phase1, phase2, pd.to_datetime(df['timestamp'].head(2)))
    toSend= df['timestamp']
    #df.loc[df['tracker'] == 'PTN', 'phase'] = phase
    #print('First timestamp: ', phase1, 'second timestamp: ', phase2, pd.to_datetime(phase1[0]).strftime(myFormatB))
    #filtered = df[df['timestamp'] >= datetime.datetime.strptime(phase1[0], myFormatB) & df['timestamp'] <= datetime.datetime.strptime(phase2[0], myFormatB)]
    #filtered = df[(df['timestamp'] >= pd.to_datetime(phase1).strftime(myFormatB)) & (df['timestamp'] <= pd.to_datetime(phase2).strftime(myFormatB))]
    filtered = df[((pd.to_datetime(df['timestamp']) >= phase1) & (
                pd.to_datetime(df['timestamp']) <= phase2))]

    #df.loc[(df['timestamp'] >= pd.to_datetime(phase1[0]).strftime(myFormatB)) & (df['timestamp'] <= pd.to_datetime(phase2[0]).strftime(myFormatB))]
    return filtered, toSend


def filteringPhasesAdding(df, phase1, phase2):
    myFormatB = '%Y-%m-%d %H:%M:%S'
    #myFormatB = '%Y-%m-%d %I:%M:%S.%f'
    #myFormatB = '%Y-%m-%d %I:%M:%S'
    phase1= pd.to_datetime(phase1.split(".")[0])
    phase2 = pd.to_datetime(phase2.split(".")[0])
    toSend=str(phase1)+str(phase2)
    #df.loc[df['tracker'] == 'PTN', 'phase'] = phase
    #print('First timestamp: ', phase1, 'second timestamp: ', phase2, pd.to_datetime(phase1[0]).strftime(myFormatB))
    #filtered = df[df['timestamp'] >= datetime.datetime.strptime(phase1[0], myFormatB) & df['timestamp'] <= datetime.datetime.strptime(phase2[0], myFormatB)]
    #filtered = df[(df['timestamp'] >= pd.to_datetime(phase1[0]).strftime(myFormatB) + timedelta(hours=4)) & (df['timestamp'] <= pd.to_datetime(phase2[0]).strftime(myFormatB)+ timedelta(hours=4))]
    filtered = df[(df['timestamp'] >= phase1.strftime(myFormatB)) & (df['timestamp'] <= phase2.strftime(myFormatB))]

    #df.loc[(df['timestamp'] >= pd.to_datetime(phase1[0]).strftime(myFormatB)) & (df['timestamp'] <= pd.to_datetime(phase2[0]).strftime(myFormatB))]

    return filtered, toSend


def filteringPhasesMinosTimeZone(df, phase1, phase2):
    myFormatB = '%Y-%m-%d %I:%M:%S'
    #myFormatB = '%Y-%m-%d %I:%M:%S.%f'
    #myFormatB = '%Y-%m-%d %I:%M:%S'
    phase1= pd.to_datetime(phase1.split(".")[0])
    phase2 = pd.to_datetime(phase2.split(".")[0])
    phase1=phase1 + pd.DateOffset(hours=-2)
    phase2 = phase2 + pd.DateOffset(hours=-2)
    toSend=str(phase1)+str(phase2)
    #df.loc[df['tracker'] == 'PTN', 'phase'] = phase
    #print('First timestamp: ', phase1, 'second timestamp: ', phase2, ' With format: ', phase1.strftime(myFormatB), df.head(10))

    #filtered = df[df['timestamp'] >= datetime.datetime.strptime(phase1[0], myFormatB) & df['timestamp'] <= datetime.datetime.strptime(phase2[0], myFormatB)]
    #filtered = df[(df['timestamp'] >= pd.to_datetime(phase1[0]).strftime(myFormatB) + timedelta(hours=4)) & (df['timestamp'] <= pd.to_datetime(phase2[0]).strftime(myFormatB)+ timedelta(hours=4))]
    filtered = df[(df['timestamp'] >= phase1.strftime(myFormatB)) & (df['timestamp'] <= phase2.strftime(myFormatB))]

    #df.loc[(df['timestamp'] >= pd.to_datetime(phase1[0]).strftime(myFormatB)) & (df['timestamp'] <= pd.to_datetime(phase2[0]).strftime(myFormatB))]

    return filtered, toSend

def asign_phases(df, phase1, phase2):
    myFormat = '%Y-%m-%d %I:%M:%S'
    myFormatB = '%Y-%m-%d %H:%M:%S'
    #df.iloc[df['tracker'] == 'PTN', 'phase'] = phase

    if (phases is None):
        df['phase'] = 'none'
    else:
        phases = pd.read_excel(phases, lines=True)
        session = (df.session.unique())
        print (session[0])
        df_filtered = phases[phases['session'] == int(session[0])]
        array_filtered = df_filtered.to_numpy()[0]
        print (len(df_filtered.to_numpy()[0]))
        df['phase'] = 'none'
        for x in range(1, len(df_filtered.to_numpy()[0])-1):
            initialTime = pd.to_datetime(array_filtered[x]).strftime(myFormat)
            endTime = pd.to_datetime(array_filtered[x+1]).strftime(myFormat)
            initialTimeOpt = pd.to_datetime(array_filtered[x]).strftime(myFormatB)
            endTimeOpt = pd.to_datetime(array_filtered[x + 1]).strftime(myFormatB)
            #initialTime = array_filtered[x]
            #endTime = array_filtered[x+1]
            phase = 'phase ' + str(x)
            print (initialTime, endTime, phase)
            df.loc[((df['timestamp'] >= initialTime) & (df['timestamp'] < endTime)) | ((df['timestamp'] >= initialTimeOpt) & (df['timestamp'] < endTimeOpt)), 'phase'] = phase
            #df3 = df
    df.loc[df['tracker'] == 'PTN', 'phase'] = phaseS
    df = df[df.phase != 'none']
    dftrack = df[df['tracker'] == 'PTN']
    print('################ THIS IS PTN INFORMATION', dftrack)
    return df

def asign_phases1(df, phases):
    myFormat = '%Y-%m-%d %I:%M:%S'
    myFormatB = '%Y-%m-%d %H:%M:%S'
    #df.iloc[df['tracker'] == 'PTN', 'phase'] = phase

    if (phases is None):
        df['phase'] = 'none'
    else:
        phases = pd.read_excel(phases, lines=True)
        session = (df.session.unique())
        print (session[0])
        df_filtered = phases[phases['session'] == int(session[0])]
        array_filtered = df_filtered.to_numpy()[0]
        print (len(df_filtered.to_numpy()[0]))
        df['phase'] = 'none'
        for x in range(1, len(df_filtered.to_numpy()[0])-1):
            initialTime = pd.to_datetime(array_filtered[x]).strftime(myFormat)
            endTime = pd.to_datetime(array_filtered[x+1]).strftime(myFormat)
            initialTimeOpt = pd.to_datetime(array_filtered[x]).strftime(myFormatB)
            endTimeOpt = pd.to_datetime(array_filtered[x + 1]).strftime(myFormatB)
            #initialTime = array_filtered[x]
            #endTime = array_filtered[x+1]
            phase = 'phase ' + str(x)
            print (initialTime, endTime, phase)
            df.loc[((df['timestamp'] >= initialTime) & (df['timestamp'] < endTime)) | ((df['timestamp'] >= initialTimeOpt) & (df['timestamp'] < endTimeOpt)), 'phase'] = phase
            #df3 = df
    #df.loc[df['tracker'] == 'PTN', 'phase'] = phaseS
    df = df[df.phase != 'none']
    #dftrack = df[df['tracker'] == 'PTN']
    #print('################ THIS IS PTN INFORMATION', dftrack)
    return df


def session(df):
    return int(df.session.unique()[0])

def deleteRole(df, file_extension):
    # TO DO -- validate tracker to eliminate, should be a parametter
    # PTN 2018
    #df = df[df['tracker'] != 28266]
    #PTN 2019
    # TO DO - Validate where this tracker is? df = df[df['tracker'] != 28274]
    # df.loc[df['tracker'] == 26689, 'x'] = ref_patient().get('x')
    # df.loc[df['tracker'] == 26689, 'y'] = ref_patient().get('y')
    # df.loc[df['tracker'] == 28274, 'x'] = ref_patient().get('x')
    # df.loc[df['tracker'] == 28274, 'y'] = ref_patient().get('y')
    # df.loc[df['tracker'] == 26689, 'tracker'] = 'PTN'
    # df.loc[df['tracker'] == 28274, 'tracker'] = 'PTN'
    if file_extension=='.json':
        df = df[df['tracker'] != 26689]
        df = df[df['tracker'] != 28274]
    elif file_extension=='.xlsx':
        df = df[df['tracker'] != 28266]
    ## Add tracker for session 2
    return df

def addingRoles(df, phase):
    print('########### data frame and phases', df)
    print(phase)
    row_added = {'tracker': 'PTN', 'session': df.iloc[0]['session'], 'phase': phase, 'quartile': df.iloc[0]['quartile'], 'timestamp': df.iloc[0]['timestamp'], 'x': ref_patient().get('x'), 'y': ref_patient().get('y')}
    df=df.append(row_added, ignore_index=True)
    return df

def ref_patient():
    #2018
    #bed 5
    x = 3372
    y = 5620
    #bed 4
    # x = 6612
    # y = 5140

    # #2019 - validate coordinate try with x= 6100 y = 1100
    # x = 5352
    # y = 2565
    patient_coordinate = {'x': x, 'y': y}
    return patient_coordinate

#This function can fix a coordinate to validate distances between trackers and that reference point
# In the nurse case the fixed point could be, que maniking (PT), or the trolly or the medicin room etc.
# For this first attemp the fixed distance is the patient because of that what I am going to to is change the coordinate of tracker 6
def fixedReference(df):
    fixedCoordinate = ref_patient()
    df['x', 6] = fixedCoordinate.get('x')
    df['y', 6] = fixedCoordinate.get('y')
    df_fix_patient = df
    return df_fix_patient


def nameTrackers(df, listRoles):
    #value=listRoles.get(0)
    #print('Roles: @@@@@@ ', value)
    #x = value.split(",")
    for x in range(0, len(listRoles)):
        serial=int(listRoles.get(x).split(',')[1])
        role=listRoles.get(x).split(',')[0]
        df.loc[df['tracker'] == serial, 'Role'] = role

    #df["Role"] = df["enumeration"].apply(lambda x: listRoles.get(x))
    #If there is a tracker that was not capture in  the webtool, all registers for that trackers will desapear
    #df = df.query('Role.notna()')
    #print(df['tracker'].head(10), listRoles)
    #delete all the trackers that were not named
    df.dropna(subset=["Role"], inplace=True)
    #df['Role'].replace('', np.nan, inplace=True)
    #print(df.Role.unique())
    return df

def roleNum(df, df_trackers, centeredRole):
    #print('TRACKERS ',df_trackers)
    for index, row_df in df_trackers.iterrows():
        #print('Tracker: ', str(row_df['tracker']), ' Enumeration: ', row_df['enumeration'])
        if (str(row_df['tracker']).split(".")[0]==str(centeredRole)):
            centeredRole=int(row_df['enumeration'])
    return centeredRole


def creatingTimestampColumns(start, end, patientcoordinates, session):

    x=patientcoordinates.split(",")[0]
    y=patientcoordinates.split(",")[1]
    #print('patient coordinates: ', x, y)

    #start =  pd.to_datetime(start.split(".")[0])
    #end = pd.to_datetime(end.split(".")[0])
    #print('Dates in the formating.py: ', start, end)
    #THIS WAS ADDED SO THAT IT WORKS

    #start=start + pd.DateOffset(hours=-3)
    #end = end + pd.DateOffset(hours=-3)
    difference = end - start
    difference_seconds=difference.total_seconds()
    #print('the number of seconds is', difference_seconds)
    #print(data['timestamp'])
    #data= pd.date_range(end=datetime.today(), periods=100).to_pydatetime().tolist()
    #data1 = pd.date_range(start=start,end=end, periods=3).to_pydatetime().tolist()
    #data1 = pd.date_range(start=start, end=end, periods=567).to_pydatetime().tolist()

    data1 = pd.date_range(start=start, end=end, periods=difference_seconds).to_pydatetime().tolist()
    #print(data1)
    #create  the dataFrame

    df = pd.DataFrame(data1, columns=["timestamp"])
    #print(df.head(5))
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    df['tracker']=int('11111')
    df['session'] = int(session)
    df['x']=int(x)
    df['y'] = int(y)
    #print(len(df))
    df = normalization(df)
    df = df[['session', 'timestamp', 'tracker', 'x', 'y']]  # Re-order dataframe columns
    df = df.reset_index()


    #print('here we go',df)
    #print(type(data1))

    return df