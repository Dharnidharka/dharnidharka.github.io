var midiPart, notes_arr;
var player = {}, genre = "TECHNO", track_change_flag = 0, tempPlayer = {}, tempMidi, bpm = 120;
var midi, json;
var url, base_dir;
var map, track

var volumeMap = {
  '60': 0,
  '62': 0,
  '64': 0,
  '65': 0,
  '67': 0,
  '69': 0,
  '71': 0,
  '72': 0,
};

var baseVolumeMap = {
  '60': 0,
  '62': 0,
  '64': 0,
  '65': 0,
  '67': 0,
  '69': 0,
  '71': 0,
  '72': 0,
};

var filter1 = new Tone.Filter(200, "highpass");
var filter2 = new Tone.Filter(-24, "lowpass");
var filter3 = new Tone.Filter(100, "highpass");
var comp = new Tone.Compressor(-30, 3);
var cheby = new Tone.Chebyshev(50);
var vol = new Tone.Volume(-12);
var limiter = new Tone.Limiter(-6);

instrument.chain(vol, Tone.Master);

  /*
  getMubert({
    genre: "TECHNO",
    bpm: "120",
    tone: "C",
    scale: "minor",
    app: "afp"
  });
  */

  function getMubert(params){
    genre = params.genre;
    bpm = params.bpm;
    init();
  }

  function init(){
    addBuffering();
    getMidi();
    getNotes();
    setVolumeMap();
    Tone.Transport.scheduleRepeat(function(time){
      console.log(track_change_flag);
      if(midiPart){
        midiPart.stop(time);
      }
      if(track_change_flag == 0){
        playMidi(midi);
      }
      else{
        $('.item').removeClass("muted");
        $('.genre').removeClass("quadrat");
        midi = tempMidi;
        player = tempPlayer;
        playMidi(midi);
        track_change_flag = 0;
      }
      removeBuffering();
    }, "8:0:0");
    Tone.Transport.start('8*4n');
  }


  function addBuffering(){
    $('#bufferContent').removeClass('hidden');
  }

  function removeBuffering(){
    $('#bufferContent').addClass('hidden');
  }

  function setVolumeMap(){
    for(str in player){
      if(str in volumeMap){
        player[str].volume.value = baseVolumeMap[str];
        player[str].mute = false;
      }
    }
    for(str in baseVolumeMap){
      volumeMap[str] = baseVolumeMap[str];
    }
  }

  function getMidi(){
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "https://pro.mubert.com/api", false);
    var params = '{ "method": "Music", "params":[{"APP":"AFP"},{"BPM":"120.00"},{"TONE":"C"},{"SCALE":"MINOR"},{"GENRE":"'+ genre + '"}], "dt": "web", "app": "afp" }';
    xhr.send(params);
    json = JSON.parse(xhr.response);
    midi = json.data.midi;
  }

  function getNotes(){
    samples = json.data.samples;
    for(var sample in samples){
      player[sample] = new Tone.Player({
                "url" : samples[sample],
                "loop" : false
            }).toMaster();
    }
      //console.log(samples);
  }

  function getTempMidi(){
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "https://pro.mubert.com/api", false);
    var params = '{ "method": "Music", "params":[{"APP":"AFP"},{"BPM":"120.00"},{"TONE":"C"},{"SCALE":"MINOR"},{"GENRE":"'+ genre + '"}], "dt": "web", "app": "afp" }';
    xhr.send(params);
    json = JSON.parse(xhr.response);
    tempMidi = json.data.midi;
  }

  function getTempNotes(){
    samples = json.data.samples;
    for(var sample in samples){
      tempPlayer[sample] = new Tone.Player({
                "url" : samples[sample],
                "loop" : false
        }).toMaster();
    }
  }

function playMidi(file) {
  MidiConvert.load(file, function(midi) {
    // make sure you set the tempo before you schedule the events
    Tone.Transport.bpm.value = midi.header.bpm;
    midiPart = new Tone.Part(function(time, note) {
    var str = note.midi + '';
    if(str in player){
      player[str].start(time, 0, note.duration);
      if(str in volumeMap){
        player[str].volume.value = volumeMap[str];
      }
    }
    console.clear();

    }, midi.tracks[0].notes).start(0);
    midiPart.loop = true;
    Tone.Transport.bpm.value = bpm;
    //console.clear();
  });
}
  $(document).ready(function(){
      $('.item').on('click', function(){
          var id = this.id;
          if($(this).hasClass("muted")){
            $(this).removeClass("muted");
            volumeMap[id] = 0;
            if(id in player){
              player[id].mute = false;
            }
          }
          else{
            $(this).addClass("muted");
            volumeMap[id] = -100;
            if(id in player){
              player[id].mute = true;
            }
          }
      });

      $('.genre').on('click', function(){
          var id = this.id;
          genre = id;
          $('.genre').removeClass("quadrat");
          $(this).addClass("quadrat");
          track_change_flag = 1;
          getTempMidi();
          getTempNotes();
          //player = {};
          //init();
      });

  });
