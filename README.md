# obs-rules
Modification of https://github.com/vanechev/obs-tool/

The branch named gloriaRules is the one that has been modified to automatically generate multimodal learning analytic visual interfaces.

This application has different uses:
1. It is the user interfaces to plot the multimodal LA visual interfaces. 
2. It specify the initial parameters of the simulation. The parameters includes: roles (e.g. team leader), actions that are going to be observe (e.g. stopping the IV fluid), sensors to be used (e.g. E4 empaticas braceletes) and its IDs, relation of bracelets and roles to know who is wearing what (e.g. team leader is wearing E4 bracelet with ID xxxx), assessment criteria defined by teachers (e.g. students must stop the IV in less than 5 minutes after the patient deterioration).
3. This application also contain the positioning scripts used to plot proxemic bar charts, ego-networks and full-graphs.

# Characteristics of this application

Javascript web framework: NodeJS / Express 
Front end: Angular 

# How to install this application

cloned the branch named gloriaRules

in the folder obs-rules run: nodemon ./bin/www

Once the application is running validate in your browser that everything is working:

http://localhost:3000/

# Additional considerations

1. So that the application works the data base needs to be working.

Find the database schema in:


# Proxemics functionality

The scripts used to plot positioning bar charts, ego-networks and full-graphs are located in: server/routes/localisation. All scripts were developed in python. 

From the Nodejs application there is a called to the pythons scripts. See server/routes/visualisation.js function bringGraph. The script outcome is eather a bar graph or a graph with some narrative. The visual outcomes are plot in the front see client/views/timeLineRules.html, specifically in the div named graphs.





