var path = require('path');
var sqlite3 = require('sqlite3').verbose();

function Store(){
	var db_path = path.join(__dirname, '/../store');
	var db = new sqlite3.Database(db_path);
	var insert_track = db.prepare("INSERT INTO songs(artist, title, duration, url) VALUES (?, ?, ?, ?)");
	var search_track = db.prepare("SELECT * FROM songs WHERE artist = ? and title = ?");
	var add_vote = db.prepare("INSERT INTO votes(song_id, author, positive) VALUES(?, ?, ?)")
	var select_likes = db.prepare("SELECT * FROM votes WHERE song_id = ?");
	var select_random = "SELECT * FROM songs ORDER BY RANDOM() LIMIT 1;";

	var add_track = function(track)
	{
		get_track(track, function(error, db_track)
		{
			if(!db_track)
				insert_track.run(track.artist, track.title, track.getDuration(), track.url);
		});						
	}

	var get_track = function(track, callback)
	{
		search_track.get(track.artist, track.title, function(error, db_track)
		{
			callback(null, db_track);
		});				
	}

	var get_random = function(callback)
	{
		db.get(select_random, function(error, db_track) 
		{
			callback(db_track);
		})
	}

	var add_like = function(author_id, track, callback)
	{
		get_track(track, function(error, db_track)
		{
			if(db_track)
				add_vote.run(db_track.id, author_id, true);
			if(callback) callback();
		});				
	}

	var get_likes = function(track, callback)
	{
		get_track(track, function(error, db_track) {
			if(db_track)
			{
				select_likes.all(db_track.id, function(error, db_likes)
				{
					if(callback) callback(db_likes);
				});
			}
		});
	}

	return {
		add_track : add_track,
		add_like : add_like,
		get_likes : get_likes,
		get_random : get_random
	}
}

exports = module.exports = Store;