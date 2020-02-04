import './style.css';

import { BehaviorSubject, Observable, of, fromEvent, merge } from 'rxjs';
import { buffer, bufferCount, expand, filter, map,  share, tap, withLatestFrom } from 'rxjs/operators';

import { IFrameData } from './frame.interface';
import { KeyUtil } from './keys.util';
import { clampMag, runBoundaryCheck, runBallBoundaryCheck, runBallPaddleCheck, runBallBrickCheck, clampTo30FPS } from './game.util';

const boundaries = {
  left: 0,
  top: 0,
  bottom: 300,
  right: 400
};
const bounceRateChanges : any = {
  left: 1.1,
  top: 1.2,
  bottom: 1.3,
  right: 1.4
}
const baseObjectVelocity = {
  x: 30,
  y: 40,
  maxX: 250,
  maxY: 200
};

const stopObject = {
  x: 0,
  y: 0,
  maxX: 0,
  maxY: 0
};

const gameArea: HTMLElement = document.getElementById('game');
const fps: HTMLElement = document.getElementById('fps');

const update = (deltaTime: number, state: any, inputState: any): any => {
  if(state['objects'] === undefined) {
    state['objects'] = [
      { 
        x: 175, y: 270, width: 50, height: 20, 
        isPaused: true, toggleColor: '#8A2BE2', color: '#000000', 
        velocity: stopObject 
      },
    ],
    state['ball'] = [
      {
        x: 200, y: 255, radius: 15, width: 30, height: 30, 
        isPaused: true, toggleColor: '#FF0000', color: '#FF0000', 
        velocity: baseObjectVelocity 
      }
    ],

    state['brick'] = [];
    var brick_number = 0;;

    for(var i=0; i<=3; i++){
      for(var j=0; j<=10; j++){
        (state['brick'])[brick_number] =
          {
            x: 10+10*j*3.5, y: 10+10*i*3.5, width: 30, height: 30, color: '#FF0000', 
          }
          brick_number++;
        }
    }
  } else {

    fps.textContent = "Ilość pozostałych bloków: " + state['brick'].length;
    if (!state['brick'].length) { 
      gameState$.unsubscribe();
      endGame('Wygrałeś!');
    }

    state['objects'].forEach((obj : any) => {
      if (inputState['spacebar_down']) {
        obj.isPaused = !obj.isPaused;
        let newColor = obj.toggleColor;        
        obj.toggleColor = obj.color;
        obj.color = newColor;        
      }
      else if (inputState['left_arrow_down']) {
        obj.turnLeft = true;
        let newColor = obj.turnColor;        
        obj.toggleColor = obj.color;
        obj.color = newColor;        
      }
       else if (inputState['right_arrow_down']) {
        obj.turnRight = true;
        let newColor = obj.turnColor;      
        obj.toggleColor = obj.color;
        obj.color = newColor;        
      }
      else{
        if(inputState['left_arrow_up']){
          obj.turnLeft = false;
          let newColor = obj.turnColor;        
          obj.toggleColor = obj.color;
          obj.color = newColor;   
        }
        else if(inputState['right_arrow_up']){
          obj.turnRight = false;
          let newColor = obj.turnColor;        
          obj.toggleColor = obj.color;
          obj.color = newColor;   
        }
      }

      if(!obj.isPaused) {
        if(obj.turnLeft) {

          obj.x = obj.x -= baseObjectVelocity.maxX*deltaTime;
  
          const didHit = runBoundaryCheck(obj, boundaries);
          if(didHit){
            if(didHit === 'right' || didHit === 'left') {
              obj.velocity.x = 0;
            } else {
              obj.velocity.y = 0;
            }
          }
        }
  
        if(obj.turnRight) {
  
          obj.x = obj.x += baseObjectVelocity.maxX*deltaTime;
  
          const didHit = runBoundaryCheck(obj, boundaries);
          if(didHit){
            if(didHit === 'right' || didHit === 'left') {
              obj.velocity.x = 0;
            }
          }
        }
      }
    });
      
    
    state['ball'].forEach((obj : any) => {
      if (inputState['spacebar_down']) {
        obj.isPaused = !obj.isPaused;
        let newColor = obj.toggleColor;        
        obj.toggleColor = obj.color;
        obj.color = newColor;        
      }

      if(!obj.isPaused) {

        obj.x = obj.x += obj.velocity.x*deltaTime;
        obj.y = obj.y += obj.velocity.y*deltaTime;

        const didHit = runBallBoundaryCheck(obj, boundaries);    
        if(didHit){
          if(didHit === 'right' || didHit === 'left') {
            obj.velocity.x *= -bounceRateChanges[didHit];
          } else if(didHit === 'top'){
            obj.velocity.y *= -bounceRateChanges[didHit];
          }
          else{
            gameState$.unsubscribe();
            endGame('Przegrałeś!');
          }
        }
      }

      obj.velocity.x = clampMag(obj.velocity.x, 0, baseObjectVelocity.maxX);
      obj.velocity.y = clampMag(obj.velocity.y, 0, baseObjectVelocity.maxY);
    });

    const didHit = runBallPaddleCheck(state['ball'], state['objects']);
    if(didHit){
      if(didHit === 'top'){
        (state['ball'])[0].velocity.y *= -bounceRateChanges[didHit];
      }
      else if(didHit === 'left' || 'right'){
        (state['ball'])[0].velocity.x *= -bounceRateChanges[didHit];
      }
    }
    state['brick'].forEach((obj : any, index : any) =>{
      const didScore = runBallBrickCheck((state['ball'])[0], obj);
      if(didScore){
        (state['ball'])[0].velocity.y *= -bounceRateChanges[didScore];
        (state['brick']).splice(index, 1);
      }

    })
  }

  return state;
}

const render = (state: any) => {
  const ctx: CanvasRenderingContext2D = (<HTMLCanvasElement>gameArea).getContext('2d');
  ctx.clearRect(0, 0, gameArea.clientWidth, gameArea.clientHeight);

  state['objects'].forEach((obj : any) => {
    ctx.fillStyle = obj.color;
    ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
  });
  state['ball'].forEach((obj : any) => {
    ctx.beginPath();
    ctx.fillStyle = obj.color;
    ctx.arc(obj.x, obj.y, obj.radius, 0, 2 * Math.PI);
    ctx.fill();
  }); 
  state['brick'].forEach((obj : any) => {
    ctx.fillStyle = obj.color;
    ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
  });
};

const calculateStep: (prevFrame: IFrameData) => Observable<IFrameData> = (prevFrame: IFrameData) => {
  return Observable.create((observer : any) => { 
    
    requestAnimationFrame((frameStartTime) => {      
      const deltaTime = prevFrame ? (frameStartTime - prevFrame.frameStartTime)/1000 : 0;
      observer.next({
        frameStartTime,
        deltaTime
      });
    })
  })
  .pipe(
    map(clampTo30FPS)
  )
};

var frames$ = of(undefined)
  .pipe(
    expand((val) => calculateStep(val)),
    filter(frame => frame !== undefined),
    map((frame: IFrameData) => frame.deltaTime),
    share()
  )

const keysDown$ = merge(
  fromEvent(document, 'keydown')
    .pipe(
      map((event: KeyboardEvent) => {
        const name = KeyUtil.codeToKey(''+event.keyCode);
        if (name !== ''){
          let keyMap : any = {};
          keyMap[name + "_down"] = event.code + "_down";
          return keyMap;
        } else {
          return undefined;
        }      
      }),
      filter((keyMap) => keyMap !== undefined)
    ),
  fromEvent(document, 'keyup')
    .pipe(
      map((event: KeyboardEvent) => {
        const name = KeyUtil.codeToKey(''+event.keyCode);
        if (name !== ''){
          let keyMap : any = {};
          keyMap[name + "_up"] = event.code + "_up";
          return keyMap;
        } else {
          return undefined;
        }      
      }),
      filter((keyMap) => keyMap !== undefined)
    ),
);

const keysDownPerFrame$ = keysDown$
  .pipe(
    buffer(frames$),
    map((frames: Array<any>) => {
      return frames.reduce((acc, curr) => {
        return Object.assign(acc, curr);
      }, {});
    })
  );

var gameState$ = new BehaviorSubject({});

frames$
  .pipe(
    withLatestFrom(keysDownPerFrame$, gameState$),
    map(([deltaTime, keysDown, gameState]) => update(deltaTime, gameState, keysDown)),
    tap((gameState) => gameState$.next(gameState))
   
  )
  .subscribe((gameState) => {
    render(gameState);
  });



function endGame(text : string) {
  const ctx: CanvasRenderingContext2D = (<HTMLCanvasElement>gameArea).getContext('2d');
  ctx.clearRect(0, 0, gameArea.clientWidth, gameArea.clientHeight);

  ctx.textAlign = 'center';
  ctx.font = 'bold 28px Arial';
  ctx.fillText(text, gameArea.clientWidth / 2, gameArea.clientHeight / 2);

  document.getElementById("restart").style.display = "block";
}


document.getElementById("restart").addEventListener("click", restart);


function restart(){
  gameState$.unsubscribe();
  gameState$ = new BehaviorSubject({});

  frames$ = of(undefined)
  .pipe(
    expand((val) => calculateStep(val)),
    filter(frame => frame !== undefined),
    map((frame: IFrameData) => frame.deltaTime),
    share()
  );
  
  frames$
  .pipe(
    withLatestFrom(keysDownPerFrame$, gameState$),
    map(([deltaTime, keysDown, gameState]) => update(deltaTime, gameState, keysDown)),
    tap((gameState) => gameState$.next(gameState))
   
  )
  .subscribe((gameState) => {
    render(gameState);
  });

  document.getElementById("restart").style.display = "none";
}