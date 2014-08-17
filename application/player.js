var child_process = require('child_process');
var EventEmitter = require('events').EventEmitter;
var config = require('./config');

function Player(){

    var cmd_mplayer_exec = 'mplayer';
    var cmd_sleep_exec = 'sleep';
    var status = 'free';
    var decoder = null;
    var emitter = new EventEmitter();   

    var init = function(filepath, duration){        
        if(config.use_mplayer)
        {
            decoder = child_process.spawn(cmd_mplayer_exec, ['-really-quiet', '-nolirc', filepath]);
            decoder.stdout.pipe(process.stdout);
            decoder.stderr.pipe(process.stderr);
        }
        else
        {
            if(duration)
            {
                decoder = child_process.spawn(cmd_sleep_exec, [duration]);

                decoder.on('error', function (err) {
                    console.log('spawn error', err);
                });
            }
        }
    };

    var play = function(filepath, duration){
        if(!isBusy()){

            init(filepath, duration);
            setBusy();

            if(isBusy()){                
                emit('playstart');                
            }

            if(decoder)
            {
                decoder.on('exit', function(){                
                    setFree();
                    emit('playend');            
                });
            }
                                        
        }else{
            console.log('player busy, try later');
        }
    };

    var stop = function(){        

        if(decoder){        
            decoder.kill();
            decoder = null;
            setFree();
        }
        else
        {
            setFree();
            emit('playend');
        }

        console.log('player status: ' + status)     
    };

    var isBusy = function(){
        return (status == 'busy');
    };

    var setBusy = function(){
        status = 'busy';        
    };

    var setFree = function(){
        status = 'free';        
    };

    var emit = function(event, data){
        emitter.emit(event, data);
    }

    var on = function(event, callback){
        emitter.on(event, callback);
    }

    return {
        play: play,
        stop: stop,
        isBusy: isBusy,
        setFree: setFree,
        setBusy: setBusy,
        emit: emit,
        on: on
    }
}

exports = module.exports = Player;