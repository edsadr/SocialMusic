 /*
 * Configuración del sistema de cuentas de meteor
 */
 Accounts.ui.config({
  requestPermissions: {
    facebook: ['email'],
    github: ['user', 'user:email']    
  },
  requestOfflineToken: {
    google: true
  },
  passwordSignupFields: 'USERNAME_AND_EMAIL'
});

 /*
 * Definición y subscripción a colecciones 
 */
 albums = new Meteor.Collection("albums");
 Meteor.subscribe("albums");

 queue = new Meteor.Collection("queue");
 Meteor.subscribe("queue");

 Meteor.subscribe("userPresence"); 

 Meteor.subscribe("directory");

//variable del reproductor de audio
 var audio=null;

 /*
 * Plantilla que muestra los álbumes 
 */
  Template.albums_view.jamendo_albums = function () {   
     return albums.find({});
  };
  Template.albums_view.events({
    'click tr' : setAlbum, 
    'touchend tr' : setAlbum 
  });

 /*
 * Plantilla que muestra las pistas del album seleccionado
 */
  Template.tracks_view.album_name= function(){
    return Session.get('current_album_name');
  };

  Template.tracks_view.jamendo_tracks= function(){
    return Session.get('current_tracks');
  };

  Template.tracks_view.events({
    'click button' : enqueTrack, 
    'touchend button' : enqueTrack 
  });

 /*
 * Plantilla que muestra la cola de canciones programadas
 */
  Template.queue_view.jamendo_queue = function () {   
     return queue.find({playing: 0});
  };

  Template.queue_view.events({
    'click button' : removeTrack, 
    'touchend button' : removeTrack 
  });

 /*
 * Plantilla que muestra lo que se esta reproduciendo actualmente
 */
  Template.playing_info.playingsong= function(){    
    return queue.findOne({playing: 1});
  }

 /*
 * Plantilla que muestra los usuarios conectados usando meteor presence 
 */
  Template.online_users.onliners= function(){            
    return Meteor.presences.find({state: "online"});    
  }

 /*
 * Plantilla que muestra el control de siguiente para el admin
 */
  Template.playing.events({
    'click button' : nextTrack, 
    'touchend button' : nextTrack 
  });

  //Helper que obtiene el gravatar del usuario registrado
  Handlebars.registerHelper('user_image', function(userid) {         
    email=userEmail(userid);
    image='';
    if(email!=null){
      image=Gravatar.imageUrl(email); 
    }    
    return image;
  });

  //Helper que muestra el nombre del usuario desde su perfil
  Handlebars.registerHelper('user_name', function(userid) {    
    return displayName(userid);
  });

  //Helper mostrando el botón siguiente para el administrador
  Handlebars.registerHelper('user_admin', function(userid) {           
    if(isAdmin(userid)){
      return new Handlebars.SafeString("<span class=\"label label-success\">Admin</span>");
    }    
  });

  //Helper convirtiendo segundos a minutos para los tracks ya que jamendo proporciona la duración en segundos
  Handlebars.registerHelper('secs_to_mins', function(secs) {
    show_time=secs_to_mins(secs);
    return show_time;
  });

  //Helper obteniendo la imagen agrandada del álbum al cual pertenece la pista que se esta reproduciendo 
  Handlebars.registerHelper('get_big_pic', function(track_image) {    
    track_image=track_image.replace('.100.','.200.');
    return track_image;
  });

  //Helper controlando la visualización del botón de encolar pistas para usuarios registrados o la etiqueta encolada por si el la pista ya esta en la cola
  Handlebars.registerHelper('queue_button', function() {           
    if(queue.find({track_id: this.id.toString()}).count()>0){
      return new Handlebars.SafeString("<span class=\"label label-inverse\">Encolada</span>");      
    }
    else{
      if(Meteor.user()!=null){
        return new Handlebars.SafeString(
          "<button class=\"btn btn-mini btn-success\" type=\"button\" data-url=\""+this.stream+"\" data-track=\""+this.id+"\" data-name=\""+this.name+"\" data-duration=\""+secs_to_mins(this.duration)+"\">Encolar</button>"
        );
      }
      else{
        return new Handlebars.SafeString("<span class=\"label label-success\">Cree un usuario</span>");   
      }
    }
  });

  //Helper controlando el botón para remover pistas de la cola, se muestra para el dueño y para el administrador
  Handlebars.registerHelper('remove_button', function() {           
    if(this.owner===Meteor.userId() || isAdmin(Meteor.userId())){
      return new Handlebars.SafeString("<button class=\"btn btn-mini btn-danger\" data-trackid="+this._id+">Remover</button>");
    }    
  });

  //Helper mostrando el botón siguiente para que el administrador pueda saltar la pista si no es de su agrado
  Handlebars.registerHelper('next_button', function() {     
    if(checkNext() && isAdmin(Meteor.userId())){
      return new Handlebars.SafeString(
        "<button class=\"btn btn-danger\" type=\"button\">Siguiente</button>"
      );
    }    
  });
  
  /*
 * Función que se ejecuta al dar click sobre un álbum específico
 */
  function setAlbum(e){
    album_id=$(e.currentTarget).attr('id');
    Session.set("current_album", album_id);
    Session.set("current_album_name", $(e.currentTarget).find('span.label-warning').text());
    Session.set("current_artist_name", $(e.currentTarget).find('span.label-info').text());
    Session.set("current_album_image", $(e.currentTarget).find('img').attr('src'));
    Meteor.call('getAlbumTracks',album_id,function(error,data){     
      Session.set("current_tracks", data);
    });
  }

 /*
 * Función que se ejecuta al dar click sobre el botón encolar de una pista
 */
  function enqueTrack(e){
    if(queue.find({owner: Meteor.userId()}).count() < 3){
      queue.insert({
          track_id : $(e.target).attr('data-track'), 
          url: $(e.target).attr('data-url'), 
          name: $(e.target).attr('data-name'), 
          duration: $(e.target).attr('data-duration'),
          artist_name: Session.get('current_artist_name'),
          album_name: Session.get('current_album_name'),
          album_image: Session.get('current_album_image'),
          playing: 0,
          owner: Meteor.userId()
      });             
    }
    else{
      alert('No es posible tener más de 3 canciones por usuario en la cola actual');
    }
  }

 /*
 * Función que se ejecuta al dar click sobre el botón remover de una pista
 */
  function removeTrack(e){    
    trackid=$(e.target).attr('data-trackid');    
    queue.remove(trackid);
  }

 /*
 * Función que se ejecuta al dar click sobre el botón siguiente
 */
  function nextTrack(e){    
    if(checkNext()){
      Meteor.call('removeTrack',1);
      ctrack=queue.findOne({playing: 0});
      trackid=ctrack._id;            
      audio.load(ctrack.url);
      audio.play();            
      Meteor.call('playingTrack',trackid);
    }
  }

 /*
 * Función que chequea si existen más canciones para reproducir en la cola
 */
  function checkNext(){
    if(queue.find({}).count()>0){
      return true;
    }
      return false;
  }

 /*
 * Función que obtiene el correo de un usuario, este campo esta almacenado en diferentes ubicaciones dependiendo de que servicio haya usado el usuario para registrarse
 */
  function userEmail(userId) {   
    user=Meteor.users.findOne(userId);
    if(user!=null){
      if (user.emails && user.emails.length)
        return user.emails[0].address;
      if (user.services && user.services.facebook && user.services.facebook.email)
        return user.services.facebook.email;
      if (user.services && user.services.github && user.services.github.email)          
        return user.services.github.email;
      if (user.services && user.services.google && user.services.google.email)          
        return user.services.google.email;
      return null;
    }
    else{
      return null;
    }            
  }

 /*
 * Función que obtiene el nombre de usuario
 */
  function displayName(userId) {
    user=Meteor.users.findOne(userId);    
    if (user.profile && user.profile.name)
      return user.profile.name;
    return user.username;
  };

  /*
 * Función verificando si el usuario es admin y ocultando el reproductor a los usuarios específicos
 */
  function isAdmin(userId) {
    user=Meteor.users.findOne(userId);  
    console.log(user);
    if (user.admin){      
      $('#audiojs_wrapper0').show();
      return true;
    }
    $('#audiojs_wrapper0').hide();
    return false;
  };

  /*
 * Función que recibe segundos y devuelve minutos, usada por varios helpers
 */
  function secs_to_mins(secs){
    rmins=secs%60;
    if(rmins<10){
      rmins='0'+rmins;
    }
    mins=Math.floor(secs/60);
    show_time=mins+":"+rmins;
    return show_time;
  }

  /*
 * Función inicial
 */
  $(document).ready(function(){    
      audiojs.events.ready(function() {
        var a = audiojs.createAll({
            trackEnded: function() { 
              if(checkNext()){
                Meteor.call('removeTrack',1);
                nextTrack();
              }
            }
          });
        audio=a[0];     
      });        
  });