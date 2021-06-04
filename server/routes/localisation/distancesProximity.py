import numpy as np
import formatingDataSetProximity as formating
#to calculate the distances the first step we made is to pivote the table
#it could be done other way.. if we change this, the calculation of distances might change
def pivot_table(df):
    df_pivot = df.pivot_table(
        index=['timestamp'],
        columns='enumeration',
        values=["x", "y"]).reset_index()
    df_pivot.reset_index(level=0, inplace=True)
    #VALIDATE THIS LOGIC, THIS IS PROVITIONAL
    #df_pivot = formating.fixedReference(df_pivot)
    #print('####### PIVOTED', df_pivot)
    return df_pivot

def distancesBetweenTrackers(df, numberOfTrackers):
    df_pivoted = pivot_table(df)
    #print(df_pivoted.head(50))


    # if patient is None:
    #     df.loc[df['tracker'] == 26689, 'tracker'] = 'PTN'
    # else:
    #     df.loc[df['x',patient] == 26689, 'tracker'] = 'PTN'

    for x in range(1, numberOfTrackers):
        for i in range(x + 1, numberOfTrackers + 1):
            column_name = 'D_' + str(x) + '_' + str(i)
            df_pivoted[column_name] = np.sqrt((df_pivoted['x', i] - df_pivoted['x', x]) ** 2 + (df_pivoted['y', i] - df_pivoted['y', x]) ** 2)
    #print(df_pivoted.head())
    return df_pivoted

def proxemicsLabels(df_distancesBetTrackers, numberOfTrackers):
    prox_labels = []
    for x in range(1, numberOfTrackers):
        for i in range(x + 1, numberOfTrackers + 1):
            column_name = 'D_' + str(x) + '_' + str(i)
            column_nameresult = 'PL_' + str(x) + '_' + str(i)
            # Add new column
            df_distancesBetTrackers[column_nameresult] = 'False'
            #print(column_name, column_nameresult)
            df_distancesBetTrackers[column_nameresult] = np.where(
                (((df_distancesBetTrackers[column_name] / 1000) >= 0) & ((df_distancesBetTrackers[column_name]) / 1000 < 0.5)),
                # Identifies the case to apply to
                'intimate',  # This is the value that is inserted
                df_distancesBetTrackers[column_nameresult])
            df_distancesBetTrackers[column_nameresult] = np.where(
                (((df_distancesBetTrackers[column_name] / 1000) >= 0.5) & ((df_distancesBetTrackers[column_name]) / 1000 < 1)),
                # Identifies the case to apply to
                'personal',  # This is the value that is inserted
                df_distancesBetTrackers[column_nameresult])
            df_distancesBetTrackers[column_nameresult] = np.where(
                (((df_distancesBetTrackers[column_name] / 1000) >= 1) & ((df_distancesBetTrackers[column_name]) / 1000 < 4)),
                # Identifies the case to apply to
                'social',  # This is the value that is inserted
                df_distancesBetTrackers[column_nameresult])
            df_distancesBetTrackers[column_nameresult] = np.where(((df_distancesBetTrackers[column_name] / 1000) >= 4),
                # Identifies the case to apply to
                'public',  # This is the value that is inserted
                df_distancesBetTrackers[column_nameresult])
            prox_labels.append(column_nameresult)
    return df_distancesBetTrackers, prox_labels

