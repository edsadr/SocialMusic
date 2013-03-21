/*
 * Definición de métodos que puede usar el cliente que se ejecutaran en el lado del servidor
 */
Meteor.methods({
    //Obtiene las pistas de el album seleccionado en jamendo
  	getAlbumTracks: function(album_id){
      var res=Meteor.http.get("http://api.jamendo.com/get2/id+albumnum+name+duration+stream/track/json/?album_id="+album_id+"&order=numalbum_asc");      
      return res.data;
    },    
    //Actualiza el estado de la canción que se esta reproduciendo
    playingTrack: function(track_id){
      queue.update(track_id, {$set: {playing: 1}});
    },
    //Elimina la pista luego de finalizar su reproducción o si fue saltada por el admin
    removeTrack: function(track_id){      
      queue.remove({playing: 1});
    }
});	

/*
 * Publicación de colecciones y su respectiva información
 */
Meteor.publish('albums', function() {  
  return albums.find({});
});

queue = new Meteor.Collection("queue");

Meteor.publish('queue', function() {  
  return queue.find({});
});

/*
 * Permisos sobre las operaciones de la colección Queue
 */
queue.allow({
  insert: function (userId, song) {
    return true; 
  },
  update: function (userId, song, fields, modifier) {
    return false;
  },
  remove: function (userId, song) { 
    user=Meteor.users.findOne(userId);    
    admin=false
    if (user.admin)
      admin=true;
    
    return song.owner === userId || admin;
  }
});

/*
 * Publicación de la información disponible para usuarios
 */
Meteor.publish("directory", function () {
  return Meteor.users.find({}, {fields: {emails: 1, services: 1, profile: 1, username: 1, admin: 1}});
});

Meteor.publish('userPresence', function() {
  var filter = {}; 
  return Meteor.presences.find(filter, {fields: {state: true, userId: true}});
});

/*
 * Función ejecutada cuando el aplicativo es iniciado en el servidor
 */
Meteor.startup(function () {
  albums = new Meteor.Collection("albums");    
  queue.remove({});  
  if (!albums.find({}).count()){
    //Obtiene los 20 álbumes con más ranking del tag Rock en Jamendo
    var res=Meteor.http.get("http://api.jamendo.com/get2/id+name+url+image+artist_name/album/json/?tag_idstr=rock&n=20&order=ratingtotal_desc");
    res.data.forEach(function(item){            
      albums.insert({id: item.id, name: item.name, url: item.url, image: item.image, artist_name: item.artist_name });
    });
  }
});