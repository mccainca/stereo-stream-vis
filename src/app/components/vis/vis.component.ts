import { Component, OnInit } from '@angular/core';
import { AudioContext } from 'angular-audio-context';

import butterchurn from 'butterchurn';
// import butterchurnPresets from 'butterchurn-presets';
import butterchurnPresetsAll from 'butterchurn-presets/all';

import * as _ from 'lodash';

@Component({
  selector: 'app-vis',
  templateUrl: './vis.component.html',
  styleUrls: ['./vis.component.sass']
})
export class VisComponent implements OnInit {
  visualizer: any = null;
  presets: any = {};
  presetKeys: any  = [];
  presetIndexHist: any = [];
  presetIndex: any = 0;
  presetCycle: any = true;
  presetCycleLength: any = 15000;
  presetRandom: any = true;
  cycleInterval: any = null;
  displayPlay: boolean = true;
  constructor(private _audioContext: AudioContext) {}

  ngOnInit(): void {

  }
    play(): void {
     this.displayPlay = false;

     let audio = new Audio();
     audio.src = "http://amccain.ddns.net:18000/stereo";
     audio.crossOrigin = 'anonymous';

     audio.play();

     this.renderVis(audio);
   }

   renderVis(audio: HTMLAudioElement): void {
     this._audioContext = new AudioContext;
     var canvas = document.getElementById('canvas');
     this.visualizer = butterchurn.createVisualizer(this._audioContext, canvas, {
       width: 800,
       height: 600,
       pixelRatio: window.devicePixelRatio || 1,
       textureRatio: 1,
     });

     // var node = this._audioContext.createMediaElementSource(audio)


//microphone

    if ( navigator.mediaDevices ) {
      navigator.mediaDevices.getUserMedia( { audio: true, video: false } )
      .then( stream => {
        // create stream using audioMotion audio context
        const micStream = this._audioContext.createMediaStreamSource( stream );
        // connect microphone stream to analyzer
        this.visualizer.connectAudio(micStream);
        this.startRenderer();
        this.visualizer.volume = 0;
        micStream.connect(this._audioContext.destination);



      })
      .catch( err => {
        alert('Microphone access denied by user');
      });
    }
    else {
      alert('User mediaDevices not available');
    }
//end

     // var delayedAudible = this._audioContext.createDelay();
     // delayedAudible.delayTime.value = 0.26;

     // node.connect(delayedAudible)
     // get audioNode from audio source or microphone


     Object.assign(this.presets, butterchurnPresetsAll);
     this.presets = _(this.presets).toPairs().sortBy(([k, v]) => k.toLowerCase()).fromPairs().value();
     this.presetKeys = _.keys(this.presets);
     console.log(this.presetKeys.length);
     this.presetIndex = Math.floor(Math.random() * this.presetKeys.length);


     // resize visualizer

     this.visualizer.setRendererSize(800, 600);

     // render a frame
     this.nextPreset(0);
     this.cycleInterval = setInterval(() => this.nextPreset(2.7), this.presetCycleLength);

   }

    startRenderer(): void {
     requestAnimationFrame(() => this.startRenderer());
     this.visualizer.render();
   }

   nextPreset(blendTime = 5.7): void {
     this.presetIndexHist.push(this.presetIndex);
     this.presetIndex = Math.floor(Math.random() * this.presetKeys.length);
     this.visualizer.loadPreset(this.presets[this.presetKeys[this.presetIndex]], blendTime);
    }

}
