/* topology input */
var PROPERTY = {
  id: ''
};
function Property(propertyId) {
  this.id = propertyId;
}
var EXE = {
  reachable: "false",
  valueText: ''
};
function Exe(reachable, valueText) {
  this.reachable = reachable.toString();
  this.valueText = valueText;
};
var env = {
  reachable: "false",
  valueText:''
};
function Env(reachable, valueText) {
  this.reachable = reachable.toString();
  this.valueText = valueText;
};
var TASK = {
  id: '',
  exe: null,
  env: null,
  properties: []
};
function Task(id, exe, env, properties) {
  this.id = id;
  this.exe = exe;
  this.env = env;
  this.properties = properties;
};
var COLLECTION = {
  id: '',
  tasks: []
};
function Collection(id, tasks) {
  this.id = id;
  this.tasks = tasks;
};

var properties = [];

propertyIds =  [ 
  "DataPublisherOutputAddress",
  "FLPSenderInputAddress",
  "FLPSenderHeartbeatInputAddress",
  "EPNReceiverInputAddress",
  "EPNReceiverOutputAddress",
  "TrackingOutputAddress",
  "CollectorInputAddress"
];

for (var i = 0; i < propertyIds.length; i ++) {
  var property = new Property(propertyIds[i]);
  properties.push(property);
};

var tasks = [];

var exeOne = new Exe(true, '$ALICEO2_INSTALL_DIR/bin/aliceHLTW');
var taskOneProperties = [{
  access: 'write',
  property: properties[0]
}];
var taskOne = new Task('dataPublisher', exeOne, undefined, taskOneProperties);
tasks.push(taskOne);

var exeTwo = new Exe(true, '$ALICEO2_INSTALL_DIR/bin/aliceHLTWrapper Relay');
var taskTwoProperties = [{
  access: 'read',
  property: properties[0]
}, {
  access: 'read',
  property: properties[1]
}];
var taskTwo = new Task('relay', exeTwo, undefined, taskTwoProperties);
tasks.push(taskTwo);

var exeThree = new Exe(true, '$ALICEO2_INSTALL_DIR/bin/flpSender_dds');
var taskThreeProperties = [{
  access: 'write',
  property: properties[1]
}, {
  access: 'write',
  property: properties[2]
}, {
  access: 'read',
  property: properties[3]
}];
var taskThree = new Task('flpSender', exeThree, undefined, taskThreeProperties);
tasks.push(taskThree);

var exeFour = new Exe(true, '$ALICEO2_INSTALL_DIR/bin/epnReceiver_dds');
var taskFourProperties = [{
  access: 'read',
  property: properties[2]
}, {
  access: 'write',
  property: properties[3]
}, {
  access: 'write',
  property: properties[4]
}];
var taskFour = new Task('epnReciever', exeFour, undefined, taskFourProperties);
tasks.push(taskFour);

var exeFive = new Exe(true, '$ALICEO2_INSTALL_DIR/bin/aliceHLTWrapper Tracker');
var taskFiveProperties = [{
  access: 'read',
  property: properties[4]
}, {
  access: 'write',
  property: properties[5]
}];
var taskFive = new Task('tracker', exeFive, undefined, taskFiveProperties);
tasks.push(taskFive);

var exeSix = new Exe(true, '$ALICEO2_INSTALL_DIR/bin/aliceHLTWrapper GlobalMerge');
var taskSixProperties = [{
  access: 'read',
  property: properties[5]
}, {
  access: 'read',
  property: properties[6]
}];
var taskSix = new Task('merger', exeSix, undefined, taskSixProperties);
tasks.push(taskSix);

var exeSeven = new Exe(true, '$ALICEO2_INSTALL_DIR/bin/aliceHLTWrapper Collector 1');
var taskSevenProperties = [{
  access: 'write',
  property: properties[6]
}];
var taskSeven = new Task('collector', exeSeven, undefined, taskSevenProperties);
tasks.push(taskSeven);

var mainTasks = [tasks[6]];

var collections = [];
var collectionOneTasks = [tasks[0], tasks[1], tasks[2]];
var collectionOne = new Collection('flpcollection', collectionOneTasks);
collections.push(collectionOne);

var collectionTwoTasks = [tasks[3], tasks[4], tasks[5]];
var collectionTwo = new Collection('epncollection', collectionTwoTasks);
collections.push(collectionTwo);
var mainCollections = [];

var GROUP = {
  id: '',
  collections: [],
  tasks: [],
  multiplicity: 0
};
function Group(id, collections, tasks, multiplicity) {
  this.id = id;
  this.collections = collections;
  this.tasks = tasks;
  this.multiplicity = multiplicity;
};

var mainGroups = [];
var groupOneTasks = [];
var groupOneCollections = [collections[0]];
var groupOneMultiplicity = 2;
var groupOne = new Group('groupFLP', groupOneCollections, groupOneTasks, groupOneMultiplicity);
mainGroups.push(groupOne);

var groupTwoTasks = [];
var groupTwoCollections = [collections[1]];
var groupTwoMultiplicity = 4;
var groupTwo = new Group('groupEPN', groupTwoCollections, groupTwoTasks, groupTwoMultiplicity);
mainGroups.push(groupTwo);

var mainPlot = {
  tasks: mainTasks,
  collections: mainCollections,
  groups: mainGroups
} 

/* Graphical representation: Constants and objects */
var PAPER_MIDPOINT = 100;
var PADDING = 10;
var TASK_METRICS = {
  x: 0,
  y: 60,
  width: 100,
  height: 30
};

var COLLECTION_METRICS = {
  x: PADDING,
  y: 60,
  widthMin: (TASK_METRICS.width + 2 * PADDING), // 120
  widthMax: (TASK_METRICS.width + 4 * PADDING) // 230
};

var TransparentContainer = new joint.shapes.basic.Rect({
    position: {
      x: 0,
      y: 0 
    },
    attrs: { rect: { 
        fill: {
          color:'blue',
          opacity: 1
        },
        'stroke-width': 0
      } 
    }
});

var MultiplicityContainer = new joint.shapes.basic.Rect({
    position: { 
      x: 0,
      y: 0 
    },
    size: { 
      width: 30, 
      height: TASK_METRICS.height
    },
    attrs: { rect: { 
        fill: '#FFFF00',
        'stroke-width': 3,
        'text': 'multBox'
        },
        text: {
          'font-weight': 800
        }
      } 
});

var CollectionElement = new joint.shapes.basic.Rect({
    position: {
      x: 0,
      y: 0 
    },
    size: { 
      width: 0, 
      height: 0
    },
    attrs: { 
      rect: { 
        fill: '#607d8b',
        rx: 5, 
        ry: 5,
      },
      text: {
        stroke: 'white'
      }
   }
}); 

var GROUP_METRICS = {
  x: PADDING,
  y: 6 * PADDING,
  widthMin: (COLLECTION_METRICS.widthMin + 2 * PADDING), // 140
  widthMax: (COLLECTION_METRICS.widthMin * 2 + 3 * PADDING), // 270
  height: 30
};

var taskRect = new joint.shapes.basic.Rect({
    position: {
      x: 0, //(COLLECTION_METRICS.x + PADDING),
      y: 0 //Ctext.get('position').y + 20
    },
    size: {
      width: TASK_METRICS.width,
      height: TASK_METRICS.height
    },
    attrs: {
      rect: {
        fill: '#03a9f4',
        rx: 5, 
        ry: 5,
        'stroke-width': 3
      },
      text: {
        text: 'task 1',
        stroke: 'white',
        fill: 'white' 
      }
    }
});

var TITLE = new joint.shapes.basic.Text({
    position: {x: 0, y: 0},
    size: {width: 70, height: 20},
    attrs: {text: {
        text: '',
        fill: 'white',
        'class': 'masterTooltip',
        'font-size': 12,
        'font-weight': 800,
        'font-family': 'sans-serif'
      }
    }
});

/*acts as a saver of all links and elements in the graph*/
var GRAPH_MIDDLEMAN = {
  jointElements: [],
  jointLinks: []
};
function GraphMiddleman(jointElements, jointLinks) {
  this.jointElements = jointElements;
  this.jointLinks = jointLinks;
}
/* Utility functions
collection requires the number of tasks to know its height*
group requires collections and tasks to know height
collectioninput = {
  tasks: []
}
groupinput = {
  collections: [],
  freeTasks: []
}
collections have to be calculated before the group
JOL for svg plot:
SVGinput = {
  groups: [],
  collections: [],
  tasks: []
}
*/

/* creates @number task rectangle objects */
function tasksFactory(number) {
  var tasks = [];
  for (var i = 0; i < number; i ++) {
      var temptaskRect = taskRect.clone();
      temptaskRect.attr('text/class', 'masterTooltip');
      temptaskRect.attr('text/title', 'Task');
      tasks.unshift(temptaskRect);
  }
  return tasks;
}

/* creates a single task given a @name */
function taskFactory(name) {
  var temptaskRect = taskRect.clone();
  temptaskRect.attr('text/class', 'masterTooltip');
  temptaskRect.attr('text/title', name);
  changeText(temptaskRect, name.substring(0, 10));
  return temptaskRect;
}

function displayTask(task, graph) {
  graph.addCells([task]);
}

function collectionFactory(collectionName, taskNames) {
  var data = {title: TITLE.clone(), tasks: []};
  changeText(data.title, collectionName);
  var tasks = [];
  for (var i = 0; i < taskNames.length; i ++) {
    tasks.push(taskFactory(taskNames[i]));
  }
  data.tasks = tasks;
  return $.extend(true, {}, data);
}

/* sets the text in  @textObject with @text */
function changeText(textObj, text) {
  textObj.get('attrs').text.text = text; // should be with set, property 2 levels down 
}

/* populates @collection with tasks and title in @data object */
function populateCollection(collection, data) {
  var initialX = collection.get('position').x;
  var initialY = collection.get('position').y + PADDING;
  var lowerEnd = 0;
  var collectionWidth = TASK_METRICS.width;
  if (data.title !== undefined) {
    initialX += data.title.get('size').height;
    collectionWidth += data.title.get('size').height; 
  }
  data.tasks.forEach( function (task, i) {
    task.translate(initialX, initialY);
    task.translate(0, i * (TASK_METRICS.height * 1.60));
    lowerEnd = task.getBBox().corner().y;
  });
  collection.set('size', {
    width: (collectionWidth + 2 * PADDING),
    height: (lowerEnd - collection.get('position').y + PADDING)
  });
  if (data.title !== undefined) {
    data.title.set('size', {
      width: data.title.attr('text/text').length * 10,
      height: data.title.get('size').height
    });
    if (data.title.get('size').width > collection.get('size').height ) {
      collection.set('size',  {
        width: collection.get('size').width,
        height: data.title.get('size').width + PADDING*4
      });
    }
    var titleX = collection.get('position').x - (data.title.get('size').width - data.title.get('size').height) / 2;
    var titleY = collection.getBBox().bottomLeft().y - (collection.get('size').height + data.title.get('size').height)/ 2;
    data.title.set('position', {x: titleX, y: titleY});
    data.title.rotate(-90);
    collection.embed(data.title);
  }
  data.tasks.map( function(task) {
    collection.embed(task);
  });
  return collection;
}

/* displays @collection */
function displayCollection(collection, data, graph) {
  graph.addCells([collection].concat(data.tasks));
  if (data.title !== undefined) {
    graph.addCell(data.title);
  }
}

/*
data {
  id: String
  collections: collectionData[], 
  tasks: tasks[]
  multiplicity : unsigned int
}
 populates @group with tasks, collections and multiplicity @data 
return: structure for display
*/
function populateGroup(groupBox, infoGroup) {
  var lowerEndRight = 0;
  var lowerEndLeft = 0;
  var idBox = TITLE.clone();
  changeText(idBox, infoGroup.id + '(' + infoGroup.multiplicity +')');

/*   //translate should be after filling*/
  var collectionSet = [];
  lowerEndLeft = groupBox.get('position').y + PADDING;
  lowerEndRight = lowerEndLeft;
  rightEnd = groupBox.getBBox().corner().x + PADDING;
/*  if (infoGroup.collections.length > 1) {
    groupBox.set('size', {
      width: GROUP_METRICS.widthMax,
      height: GROUP_METRICS.height
    });
  }*/
  var rightTranslation = 0;
  if (infoGroup.collections.length > 0) {
    rightTranslation = groupBox.get('position').x + idBox.get('size').height + COLLECTION_METRICS.widthMax + 2 * PADDING;
  }
  var leftTranslation = groupBox.get('position').x + PADDING + idBox.get('size').height;
  for (var i = 0; i < infoGroup.collections.length; i ++) {
    /* TO DO: situate these collections better. Edge case : small collections
     from the left and large on the right */
    var tempCollection = CollectionElement.clone();
    if (lowerEndLeft <= lowerEndRight) {
      tempCollection.translate(leftTranslation, lowerEndLeft + PADDING);
      populateCollection(tempCollection, infoGroup.collections[i]);
      lowerEndLeft = tempCollection.getBBox().corner().y;
    } else  {
      tempCollection.translate(rightTranslation, lowerEndRight + PADDING);
      populateCollection(tempCollection, infoGroup.collections[i]);
      lowerEndRight = tempCollection.getBBox().corner().y;
    }
    if (rightEnd < tempCollection.getBBox().corner().x) {
      rightEnd = tempCollection.getBBox().corner().x + PADDING;
    }
    collectionSet.unshift({collection: tempCollection, tasks: infoGroup.collections[i]});
  }
  if ( infoGroup.tasks.length > 0) {
    var freeTasksCollection = TransparentContainer.clone();
    var freeTasksData = {title: undefined, tasks: infoGroup.tasks};
    if (lowerEndLeft <= lowerEndRight) {
      freeTasksCollection.translate(leftTranslation, lowerEndLeft + PADDING);
      populateCollection(freeTasksCollection, freeTasksData, true);
      lowerEndLeft = freeTasksCollection.getBBox().corner().y;
    } else {
      freeTasksCollection.translate(rightTranslation, lowerEndRight + PADDING);
      populateCollection(freeTasksCollection, freeTasksData, true);
      lowerEndRight = freeTasksCollection.getBBox().corner().y;
    }
    if (rightEnd < freeTasksCollection.getBBox().corner().x) {
      rightEnd = freeTasksCollection.getBBox().corner().x;
    }
    collectionSet.push({collection: freeTasksCollection, tasks: freeTasksData});
  }
  var groupHeight = (lowerEndRight < lowerEndLeft ? lowerEndLeft : lowerEndRight) -
                  groupBox.get('position').y + PADDING;
  groupBox.set('size', {
    width: rightEnd - groupBox.get('position').x,
    height: groupHeight 
  });
/*  var multiplicityContainer = MultiplicityContainer.clone();
  multiplicityContainer.attr('text/text', infoGroup.multiplicity);
  multiplicityContainer.translate(groupBox.getBBox().origin().x + 5,
    groupBox.getBBox().origin().y) ;*/
  idBox.set('size', {
    width: idBox.attr('text/text').length * 12,
    height: idBox.get('size').height
  });
  idBox.translate(0, groupBox.get('position').y);
  if (idBox.getBBox().origin().y + idBox.get('size').width / 2 > groupBox.getBBox().bottomLeft().y) {
    groupBox.set('size',  {
      width: groupBox.get('size').width,
      height: idBox.get('size').width + PADDING*4
    })
  }
  idBox.translate(0, groupBox.get('size').height / 2)
  idBox.rotate(-90);
  idBox.set('position', {
    x: groupBox.get('position').x - idBox.get('size').width / 2 + idBox.get('size').height,
    y: idBox.get('position').y
  });
  groupBox.embed(idBox);
  //groupBox.embed(multiplicityContainer);
  collectionSet.map( function (collection) {
    groupBox.embed(collection.collection);
  });
  return [{plot:groupBox, title: idBox}].concat([{data: collectionSet}]);
}

/*  displays  @group and the @data embedded in it */
function displayGroup(group, data, graph) {
  graph.addCells([group.plot]);
  graph.addCells([group.title]);
  data.data.map(function(element) {
    displayCollection(element.collection, element.tasks, graph);
  });
}

/* adds @PropertyList onChange functionality */
function displayPropertyLinks(property, graph, jointJsMiddleman) {
  var propLinks = getLinksWithProperty(graph, jointJsMiddleman, property);
  propLinks.forEach( function (link) {
    link.attr('.connection/stroke', 'red');
  })
}

/* Maps @groups, @collections, @tasks that are in main */
function mapTemplate(contentMain, graph) {
  var shifterY = 60;
  var collectionYielder = CollectionElement.clone();
  collectionYielder.set('position', {
    x: COLLECTION_METRICS.x,
    y: COLLECTION_METRICS.y
  });
  for (var i = 0; i < contentMain.collections.length; i ++) {
    var collectData = collectionFactory(contentMain.collections[i].id,
      extractProperties(contentMain.collections[i].tasks, 'id'));
    collectData.tasks.forEach (function (task, j) {
      task.prop('properties', contentMain.collections[i].tasks[j].properties);
    });
    var colCell = collectionYielder.clone();
    colCell.translate(PAPER_MIDPOINT - (COLLECTION_METRICS.widthMin / 2),0)
    var collection = populateCollection(colCell, collectData);
    shifterY = collection.getBBox().corner().y + PADDING;
    collectionYielder.set('position', {
      x: collectionYielder.get('position').x,
      y: shifterY
    })
    displayCollection(collection, collectData, graph);
  }
  var groupWidth = 0;
  var GroupYielder = GroupElement.clone();
  for (var i = 0; i < contentMain.groups.length; i ++) {
    GroupYielder.set('position', {
      x: GROUP_METRICS.x,
      y: shifterY
    });
    var groupCollections = contentMain.groups[i].collections.map( function (collection) {
      return collectionFactory(collection.id,
          extractProperties(collection.tasks, 'id'));
    });
    var groupTasks = extractProperties(contentMain.groups[i].tasks, 'id').map(function (id) {
      return taskFactory(id);
    });
    groupCollections.forEach( function(collection, m) {
      collection.tasks.forEach ( function(task, k) {
        task.prop('properties', contentMain.groups[i].collections[m].tasks[k].properties);
      })
    });
    groupTasks.forEach (function (task, j) {
      task.prop('properties', contentMain.groups[i].tasks[j].properties);
    });
    var tObject = {
      collections: groupCollections,
      id: contentMain.groups[i].id,
      multiplicity: contentMain.groups[i].multiplicity,
      tasks: groupTasks
    }
    var groupCell = GroupYielder.clone();
    groupCell.translate(PAPER_MIDPOINT - GROUP_METRICS.widthMin / 2, 0);
    var group = populateGroup(groupCell, tObject);
    shifterY = group[0].plot.getBBox().corner().y + 2 * PADDING;
    if (groupWidth < group[0].plot.get('size').width) {
      groupWidth = group[0].plot.get('size').width
    }    
    displayGroup(group[0], group[1], graph);
  }
  for (var i = 0; i < contentMain.tasks.length; i ++) {
    var mainTask = taskFactory(contentMain.tasks[i].id);
    if ( contentMain.tasks.length > 5) {
      mainTask.translate(PAPER_MIDPOINT, shifterY);
      mainTask.translate(Math.floor(i / 5) * (TASK_METRICS.width + PADDING),
        (i % 5) * (TASK_METRICS.height + 2 * PADDING));
    } else {
      mainTask.translate((PAPER_MIDPOINT - TASK_METRICS.width / 2), shifterY);
      mainTask.translate(0, i * (TASK_METRICS.height + 2 * PADDING));
    }
    mainTask.prop('properties', contentMain.tasks[i].properties);
    displayTask(mainTask, graph);
  }
}

/* maps @properties Links */
function mapLinks(graph) {
  var plotLinks = [];
  var plotTasks = sieveByProperty(graph.getElements(), 'properties');

  for (var i = 0; i < plotTasks.length; i ++) {
    for (var j = i + 1; j < plotTasks.length; j ++) {
      if (plotTasks[i].get('attrs').text.text != plotTasks[j].get('attrs').text.text) {
        var interSection = findTasksLinks(plotTasks[i].prop('properties'), plotTasks[j].prop('properties'), i, j);
        interSection.forEach (function (_property, i) {
          var sourceBBox = plotTasks[_property.source].getBBox();
          var destinationBBox = plotTasks[_property.destination].getBBox();
          var link;
          if (sourceBBox.origin().y > destinationBBox.origin().y) {
            link = V('line', {
              x1: sourceBBox.bottomLeft().x + ((sourceBBox.corner().x - sourceBBox.bottomLeft().x) / (interSection.length + 1)) * (i + 1), 
              y1: sourceBBox.origin().y,
              x2: destinationBBox.origin().x + ((destinationBBox.topRight().x - destinationBBox.origin().x) / (interSection.length +1)) * (i + 1),
              y2: destinationBBox.corner().y + 6,
              stroke: '#8bc34a',
              'stroke-width': 2,
              'title': _property.id,
              'class': 'masterTooltip',
              'marker-end': "url(#arrowMarker)"
            });
          } else {
            link = V('line', {
              x1: sourceBBox.bottomLeft().x + ((sourceBBox.corner().x - sourceBBox.bottomLeft().x) / (interSection.length + 1)) * (i + 1), 
              y1: sourceBBox.corner().y,
              x2: destinationBBox.origin().x + ((destinationBBox.topRight().x - destinationBBox.origin().x) / (interSection.length + 1)) * (i + 1),
              y2: destinationBBox.origin().y - 6,
              stroke: '#8bc34a',
              'class': 'masterTooltip',
              'stroke-width': 2,
              'title': _property.id,
              'marker-end': "url(#arrowMarker)"
            });  
          }
          plotLinks.push(link);
        });
      }
    }
  }
  return plotLinks;
}

function mapLinksForTask(graph, task) {
  var plotLinks = [];
  var graphTasks = sieveByProperty(graph.getElements(), 'properties');
  var taskName = task.get('attrs').text.text;
  graphTasks.unshift(task);
  for (var i = 1; i < graphTasks.length; i ++) {
    if ( graphTasks[i].get('attrs').text.text != taskName) {
      var interSection = findTasksLinks(graphTasks[i].prop('properties'), task.prop('properties'), i, 0);
      interSection.forEach( function (_property, i) {
          var sourceBBox = graphTasks[_property.source].getBBox();
          var destinationBBox = graphTasks[_property.destination].getBBox();
          var link;
          if (sourceBBox.origin().y > destinationBBox.origin().y) {
            link = V('line', {
              x1: sourceBBox.bottomLeft().x + ((sourceBBox.corner().x - sourceBBox.bottomLeft().x) / (interSection.length + 1)) * (i + 1), 
              y1: sourceBBox.origin().y,
              x2: destinationBBox.origin().x + ((destinationBBox.topRight().x - destinationBBox.origin().x) / (interSection.length +1)) * (i + 1),
              y2: destinationBBox.corner().y + 3,
              stroke: '#8bc34a',
              'stroke-width': 2,
              'title': _property.id,
              'class': 'masterTooltip',
              'marker-end': "url(#arrowMarker)"
            });
          } else {
            link = V('line', {
              x1: sourceBBox.bottomLeft().x + ((sourceBBox.corner().x - sourceBBox.bottomLeft().x) / (interSection.length + 1)) * (i + 1), 
              y1: sourceBBox.corner().y,
              x2: destinationBBox.origin().x + ((destinationBBox.topRight().x - destinationBBox.origin().x) / (interSection.length + 1)) * (i + 1),
              y2: destinationBBox.origin().y - 3,
              stroke: '#8bc34a',
              'class': 'masterTooltip',
              'stroke-width': 2,
              'title': _property.id,
              'marker-end': "url(#arrowMarker)"
            });  
          }
          plotLinks.push(link);
        });
    }
  }
  return plotLinks;
}

/* creates @properties dropdown */
function setPropertyList(properties) {
  var sel = document.getElementById('PropertyList');
  var fragment = document.createDocumentFragment();
  properties.forEach(function(property) {
      var opt = document.createElement('option');
      opt.innerHTML = property.id;
      opt.value = property.id;
      fragment.appendChild(opt);
  });
  sel.appendChild(fragment);
}

/* adds @property to the topology */
function addProperty() {
  var property = new Property(document.forms['property_form']['property'].value);
  var writer = document.forms['property_form']['writer'].value;
  var reader = document.forms['property_form']['reader'].value;
  setPropertyList([property]);
  var checkTask = function (task) {
    if (task.id === writer) {
      task.properties.push({
        access: 'write',
        property: property
      })
    }
    if (task.id === reader) {
      task.properties.push({
        access: 'read',
        property: property
      });
    }
  };
  properties.push(new Property(property));
  mainPlot.tasks.forEach( function (task,i) {
    checkTask(task);
  });
  mainPlot.collections.forEach( function (collection) {
    collecton.tasks.forEach( function (task) {
      checkTask(task);
    });
  });
  mainPlot.groups.forEach( function (group) {
    group.tasks.forEach( function (task) {
      checkTask(task);
    })
    group.collections.forEach( function (collection) {
      collection.tasks.forEach( function (task) {
        checkTask(task);
      });
    });
  });
  updateJointComponent(mainPlot);
}

/* making  a group */
var GroupElement = new joint.shapes.basic.Rect({
  position: { 
    x: GROUP_METRICS.x,
    y: GROUP_METRICS.y
  },
  size: {
    width: GROUP_METRICS.widthMin,
    height: GROUP_METRICS.height
  },
  attrs: {
    rect: { 
      fill: '#009688',
      rx: 2,
      ry: 2
    }
  }
});

//var group = populateGroup(GroupElement.clone(), groupData);
//displayGroup(group[0], group[1]);

/*var nodesGraph = new joint.dia.Graph;

var nodesPaper = new joint.dia.Paper({
    el: $('#tasksGraph'),
    width: 600,
    height: 600,
    model: nodesGraph,
    gridSize: 1
});

var visTasks = tasks.map( function(task) {
  var rectBox = taskFactory(task.id);
  return {rectBox: rectBox, task:task};
})

var propLinks = [];
for (var i = 0; i < visTasks.length; i ++) {
  visTasks[i].rectBox.translate((6 * PADDING) * ((i % 3) + 1) + (i % 3) * TASK_METRICS.width,
                                (10 * PADDING)* Math.floor(1 + (i / 3)));
  for (var j = 0; j < visTasks[i].task.properties.length; j++) {
    for (var k = i + 1; k < visTasks.length; k ++) {
      if (_.contains(extractProperties(visTasks[k].task.properties, 'property'),
        visTasks[i].task.properties[j].property)) {
        var sourceId = visTasks[i].rectBox.id;
        var targetId = visTasks[k].rectBox.id;
        if (visTasks[i].task.properties[j].access === 'read') {
          sourceId = visTasks[k].rectBox.id;
          targetId = visTasks[i].rectBox.id;
        } 
        var propLink = new joint.dia.Link({
          source: { id: sourceId },
          target: { id: targetId },
          connector: {name: 'rounded'}
        });
        propLink.attr({
          '.connection-wrap': {
            'title': visTasks[i].task.properties[j].property.id
           },
          '.connection': { 
            stroke: 'blue',
            'stroke-width': 4
          },
          '.marker-target': {
            fill: 'yellow',
            d: 'M 10 0 L 0 5 L 10 10 z'
            }
        })
        propLinks.push(propLink);
        }
     }
  }
}


/* -------nodesGraph Events ----------- */
/*
var nodesMyAdjustVertices = _.partial(adjustVertices, nodesGraph);
nodesGraph.on('add remove change:source change:target', nodesMyAdjustVertices);
nodesPaper.on('cell:pointerup', nodesMyAdjustVertices);

/*------------------------------------- */
/*
nodesGraph.addCells(visTasks.map(function (vistask) {
  return vistask.rectBox;
}));
nodesGraph.addCells(propLinks);
*/