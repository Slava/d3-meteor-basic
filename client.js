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
        graph.addLink(doc.source, doc.target, doc.value);
      },
      removed: function (doc) {
        graph.removeLink(doc.source, doc.target);
      }
    });
  };
}

function myGraph(el) {

  // Add and remove elements on the graph object
  this.addNode = function (id) {
    nodes.push({"_id":id});
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

  this.removeLink = function (source,target){
    for(var i=0;i<links.length;i++)
    {
      if(links[i].source._id == source && links[i].target._id == target)
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

  this.addLink = function (source, target, value) {
    links.push({"source":findNode(source),"target":findNode(target),"value":value});
    update();
  };

  var findNode = function(id) {
    for (var i in nodes) {
      if (nodes[i]["_id"] === id) return nodes[i];};
  };

  var findNodeIndex = function(id) {
    for (var i=0;i<nodes.length;i++) {
      if (nodes[i]._id==id){
        return i;
      }
    };
  };

  // set up the D3 visualisation in the specified element
  var w = 500,
  h = 500;
  var vis = d3.select(el)
  .append("svg:svg")
  .attr("width", w)
  .attr("height", h)
  .attr("id","svg")
  .attr("pointer-events", "all")
  .attr("viewBox","0 0 "+w+" "+h)
  .attr("perserveAspectRatio","xMinYMid")
  .append('svg:g');

  var force = d3.layout.force();

  var nodes = force.nodes(),
  links = force.links();

  var update = function () {
    var link = vis.selectAll("line")
    .data(links, function(d) {
      return d._id;
    });

    link.enter().append("line")
    .attr("id",function(d){return d._id;})
    .attr("class","link");
    link.append("title")
    .text(function(d){
      return d.value;
    });
    link.exit().remove();

    var node = vis.selectAll("g.node")
    .data(nodes, function(d) { return d._id;});

      var nodeEnter = node.enter().append("g")
      .attr("class", "node")
      .call(force.drag);

      nodeEnter.append("svg:circle")
      .attr("r", 16)
      .attr("id",function(d) { return "Node;"+d._id;})
      .attr("class","nodeStrokeClass");

      nodeEnter.append("svg:text")
      .attr("class","textClass")
      .text( function(d){return d._id;}) ;

      node.exit().remove();
      force.on("tick", function() {

        node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y         + ")"; });

        link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });
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
