import React from 'react';
import {
  AppRegistry,
  asset,
  StyleSheet,
  Pano,
  Text,
  View,
  Model,
  AmbientLight,
  Animated,
  VrHeadModel
} from 'react-vr';

const DEFAULT_ANIMATION_BUTTON_RADIUS = 50;
const DEFAULT_ANIMATION_BUTTON_SIZE = 0.05;

const AnimatedPano = Animated.createAnimatedComponent(Pano);

export default class HouseVR_Navigation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      scenes: [{
          scene_image: '1.jpg',
          step: 1,
          position: {x: 6.6, y: 10.8},
          rotation: [1, 147, 0],
          navigations: [{
              step: 2,
          }]
      }, {
          scene_image: '2.jpg',
          step: 2,
          position: {x: 8.4, y: 9.9},
          rotation: [2.1, 181, 0],
          navigations: [{
              step: 3,
          }]
      }, {
          scene_image: '3.jpg',
          step: 3,
          position: {x: 8.7, y: 8},
          rotation: [0, -68, 0],
          navigations: [{
              step: 4,
          }]
      }, {
          scene_image: '4.jpg',
          step: 4,
          position: {x: 7.1, y: 7.1},
          rotation: [0, -71, 0],
          navigations: [{
              step: 5,
          }]
      }, {
          scene_image: '5.jpg',
          step: 5,
          position: {x: 5.3, y: 7.6},
          rotation: [0, 12, 0],
          navigations: [{
              step: 6,
          }]
      }, {
          scene_image: '6.jpg',
          step: 6,
          position: {x: 5.3, y: 9.5},
          rotation: [0, 12.5, 0],
          navigations: [{
              step: 1,
          }]
      }],
      current_scene: {
        scene_image: '1.jpg',
        step: 1,
        position: {x: 6.6, y: 10.8},
        rotation: [1, 146.5, 0],
        navigations: [{
          step: 2,
        }]
      },
      animationWidth: DEFAULT_ANIMATION_BUTTON_SIZE,
      animationRadius: DEFAULT_ANIMATION_BUTTON_RADIUS,
      cameraX: new Animated.Value(6.6),
      cameraY: -1.4,
      cameraZ: new Animated.Value(10.8),
      currentPositionX: 6.6,
      currentPositionY: 10.8,
      fadeValue: new Animated.Value(1),
      flagMoving: false,
    };
    // add event
    window.addEventListener('message', this.onMainWindowMessage);
  }

  componentWillUnmount() {
    if (this.frameHandle) {
      cancelAnimationFrame(this.frameHandle);
      this.frameHandle = null;
    }
  }

  componentDidMount() {
    this.animatePointer();
  }

  onMainWindowMessage = (e) => {
    switch (e.data.type) {
      case 'newCoordinates':
        var scene_navigation = this.state.current_scene.navigations[0];
        this.state.current_scene.navigations[0]['translate'] = [e.data.coordinates.x,e.data.coordinates.y,e.data.coordinates.z]
        this.forceUpdate();
      break;
      default:
      return;
    }
  }

  onPanoInput = (e) => {
    if (e.nativeEvent.inputEvent.eventType === 'keydown'){
      this.rotatePointer(e.nativeEvent.inputEvent)
    }
  }

  onNavigationClick = (item, e) => {
    if(e.nativeEvent.inputEvent.eventType === "mousedown" && e.nativeEvent.inputEvent.button === 0){
      cancelAnimationFrame(this.frameHandle);
      var new_scene = this.state.scenes.find(i => i['step'] === item.step);
      this.setState({current_scene: new_scene});
      postMessage({ type: "sceneChanged"})
      this.state.animationWidth = DEFAULT_ANIMATION_BUTTON_SIZE;
      this.state.animationRadius = DEFAULT_ANIMATION_BUTTON_RADIUS;
      this.animatePointer();
    }
  }

  rotatePointer(nativeEvent){
      switch (nativeEvent.keyCode) {
        case 37:
          Animated.timing(
            this.state.cameraX,
            {
              toValue: ++this.state.currentPositionX,
              duration: 500,
              delay: 0
            }
          ).start();
        break;
        case 38:
          Animated.timing(
            this.state.cameraZ,
            {
              toValue: ++this.state.currentPositionY,
              duration: 500,
              delay: 0
            }
          ).start();
        break;
        case 39:
          Animated.timing(
            this.state.cameraX,
            {
              toValue: --this.state.currentPositionX,
              duration: 500,
              delay: 0
            }
          ).start();
        break;
        case 40:
          Animated.timing(
            this.state.cameraZ,
            {
              toValue: --this.state.currentPositionY,
              duration: 500,
              delay: 0
            }
          ).start();
        break;
        case 32: //space
          this.state.flagMoving = !this.state.flagMoving;
        break;
        case 65:
          // a
          var prev_scene = this.state.scenes.find(i => i.navigations[0]['step'] === this.state.current_scene['step']);
          this.setState({current_scene: prev_scene});
        break;
        case 68:
          // d
          var next_scene = this.state.scenes.find(i => i['step'] === this.state.current_scene.navigations[0].step);
          Animated.timing(
            this.state.fadeValue,
            {
              toValue: 0,
              duration: 1000
            }
          ).start();
          setTimeout(() => {
            this.state.flagMoving = true;
          }, 300)
          Animated.timing(
            this.state.cameraX,
            {
              toValue: next_scene.position.x,
              duration: 500
            }
          ).start();
          Animated.timing(
            this.state.cameraZ,
            {
              toValue: next_scene.position.y,
              duration: 500
            }
          ).start();
          setTimeout(() => {
            this.setState({current_scene: next_scene});
            Animated.timing(
              this.state.fadeValue,
              {
                toValue: 1,
                duration: 1000,
              }
            ).start();
          }, 300)
          setTimeout(() => {
            this.state.flagMoving = false;
          }, 800)
        break;
        case 70:
          const rotation=VrHeadModel.yawPitchRoll();
          console.log(rotation);
        break;
        default:
        return;
      }
      console.log(this.state.currentPositionX, this.state.currentPositionY);
      this.forceUpdate();
  }

  animatePointer = () => {
    var delta = this.state.animationWidth + 0.002;
    var radius = this.state.animationRadius + 10;
    if(delta >= 0.13){
      delta = DEFAULT_ANIMATION_BUTTON_SIZE;
      radius = DEFAULT_ANIMATION_BUTTON_RADIUS;
    }
    this.setState({animationWidth: delta, animationRadius: radius})
    this.frameHandle = requestAnimationFrame(this.animatePointer);
  }

  sceneOnLoad = () => {
    postMessage({ type: "sceneLoadStart"})
  }

  sceneOnLoadEnd = () => {
    postMessage({ type: "sceneLoadEnd"})
  }

  render() {
    return (
      <Animated.View
        style={{ 
          transform: [
            { 
              translate: [
                this.state.cameraX, 
                this.state.cameraY, 
                this.state.cameraZ,
              ] 
            },
          ]
        }}
        onInput={this.onPanoInput}
        >
        <AnimatedPano 
          source={asset(this.state.current_scene.scene_image)}
          onLoad={this.sceneOnLoad}
          onLoadEnd={this.sceneOnLoadEnd}
          style={{
            opacity: this.state.fadeValue,
            transform: [
                {rotateX: this.state.current_scene.rotation[0]},
                {rotateY: this.state.current_scene.rotation[1]},
                {rotateZ: this.state.current_scene.rotation[2]},
            ]
          }}
        />
        <AmbientLight intensity={1.0} />
        <Model 
          style={{ 
            transform: [
              { rotateX: -90 },
              { rotateY: 0 },
              { rotateZ: 90 },
            ],
            display: this.state.flagMoving ? "flex" : "none"
          }}
          source={{ obj: asset('a8fa98bd0c324f808f6cd441cdeacccc.obj'), mtl: asset('a8fa98bd0c324f808f6cd441cdeacccc.mtl') }} 
          lit={ true }
        />
      </Animated.View>
    );
  }
};

AppRegistry.registerComponent('HouseVR_Navigation', () => HouseVR_Navigation);
