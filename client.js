Things = new Meteor.Collection("things");
Links = new Meteor.Collection("links");

if (Meteor.isClient) {
  Template.diagram.rendered = function () {
    var graph;
    graph = new myGraph("#svgdiv");
    Things.find().observe({
      added: function (doc) {
        graph.addNode(doc._id);
      },
      removed: function (doc) {
        graph.removeNode(doc._id);
      }
    });

    Links.find().observe({
      added: function (doc) {
        graph.addLink(doc._id, doc.source, doc.target, doc.value);
      },
      removed: function (doc) {
        graph.removeLink(doc._id);
      }
    });
  };
}

function myGraph(el) {

  // Add and remove elements on the graph object
  this.addNode = function (id) {
    nodes.push({"id":id});
    update();
  };

  this.removeNode = function (id) {
    var i = 0;
    var n = findNode(id);
    while (i < links.length) {
      if ((links[i]['source'] == n)||(links[i]['target'] == n))
        {
          links.splice(i,1);
        }
        else i++;
    }
    nodes.splice(findNodeIndex(id),1);
    update();
  };

  this.removeLink = function (id){
    for(var i=0;i<links.length;i++)
    {
      if(links[i].id === id)
        {
          links.splice(i,1);
          break;
        }
    }
    update();
  };

  this.removeallLinks = function(){
    links.splice(0,links.length);
    update();
  };

  this.removeAllNodes = function(){
    nodes.splice(0,links.length);
    update();
  };

  this.addLink = function (id, source, target, value) {
    links.push({id: id, "source":findNode(source),"target":findNode(target),"value":value});
    update();
  };

  var findNode = function(id) {
    for (var i in nodes) {
      if (nodes[i]["id"] === id) return nodes[i];};
  };

  var findNodeIndex = function(id) {
    for (var i=0;i<nodes.length;i++) {
      if (nodes[i].id==id){
        return i;
      }
    };
  };

  // set up the D3 visualisation in the specified element
  var w = 500,
  h = 500;
  var svg = d3.select(el)
    .append("svg:svg")
    .attr("width", w)
    .attr("height", h)
    .attr("id","svg")
    .attr("pointer-events", "all")
    .attr("viewBox","0 0 "+w+" "+h)
    .attr("perserveAspectRatio","xMinYMid");
  var vis = svg.append('svg:g');

  var force = d3.layout.force();

  var nodes = force.nodes(),
  links = force.links();

  // build the arrow.
  svg.append("svg:defs").selectAll("marker")
      .data(["end"])      // Different link/path types can be defined here
    .enter().append("svg:marker")    // This section adds in the arrows
      .attr("id", String)
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 15)
      .attr("refY", -1.5)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
    .append("svg:path")
      .attr("d", "M0,-5L10,0L0,5");

  var update = function () {
    var link = vis.selectAll("path")
      .data(links, function(d) {
        return d.id;
      });

    link.enter().append("svg:path")
      .attr("id",function(d){return d.id;})
      .attr("class","link")
      .attr("marker-end", "url(#end)");

    link.append("title")
      .text(function(d){
        return d.value;
      });

    link.exit().remove();

    var node = vis.selectAll("g.node")
    .data(nodes, function(d) { return d.id;});

    var nodeEnter = node.enter().append("g")
      .attr("class", "node")
      .call(force.drag);

    nodeEnter.append("svg:circle")
      .attr("r", 16)
      .attr("id",function(d) { return "Node;"+d.id;})
      .attr("class","nodeStrokeClass");

    nodeEnter.append("svg:text")
      .attr("class","textClass")
      .text( function(d){return d.id;}) ;

    node.exit().remove();

    force.on("tick", function() {
      node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y         + ")"; });

      link.attr("d", function(d) {
          var dx = d.target.x - d.source.x,
              dy = d.target.y - d.source.y,
              dr = Math.sqrt(dx * dx + dy * dy);
          return "M" + 
              d.source.x + "," + 
              d.source.y + "A" + 
              dr + "," + dr + " 0 0,1 " + 
              d.target.x + "," + 
              d.target.y;
      });
        
    });

      // Restart the force layout.
      force
        .gravity(.05)
        .distance(50)
        .linkDistance( 50 )
        .size([w, h])
        .start();
  };


  // Make it all go
  update();
}
