def numberTrackers(df):
    tracker = df.tracker.unique()
    #print(tracker)
    return (len(tracker))

#Funtion to enumerate all trackers from 1 to n, n the number of trackers
def enumerate_trackers(df):
    df_trackers = df.groupby(['session', 'tracker'], as_index=False)['timestamp'].count()
    df_trackers = df_trackers[['session', 'tracker']].set_index('session')
    prev_index = '-1'
    cont = 0
    enumeration = []
    for index, track in df_trackers.iterrows():
        if (index == prev_index):
            cont = cont + 1
        else:
            cont = 1
        enumeration.append(cont)
        prev_index = index
    df_trackers['enumeration'] = enumeration
    df_trackers.reset_index(level=0, inplace=True)
    return df_trackers

def asignEnumTrackers(df, enum_trackers):
    tracker_enum = []
    for index, row_df in df.iterrows():
        data = enum_trackers.loc[(enum_trackers['session'] == row_df['session']) & (enum_trackers['tracker'] == row_df['tracker'])]
        tracker_enum.append(data['enumeration'].values[0])
    df['enumeration'] = tracker_enum
    return df
