import { IFrameData } from './frame.interface';

export const clampMag = (value: number, min: number, max: number) => {
  let val = Math.abs(value);
  let sign = value < 0 ? -1 : 1;
  if(min <= val && val <= max) {
    return value;
  }
  if(min > val) {
    return sign*min;
  }
  if(max < val) {
    return sign*max;
  }
};

export const clampTo30FPS = (frame: IFrameData) => {
 if(frame.deltaTime > (1/30)) {
    frame.deltaTime = 1/30;
  }
  return frame;
}

export const runBoundaryCheck = (obj: any, boundaries: {top: number, right: number, bottom: number, left: number}): string => {
  let boundaryHit = '';
  if (obj.x + obj.width > boundaries.right) {
    boundaryHit = 'right';
    obj.x = boundaries.right - obj.width;
  } else if (obj.x < boundaries.left) {
    boundaryHit = 'left';
    obj.x = boundaries.left;
  }
  return boundaryHit;
};

export const runBallBoundaryCheck = (obj: any, boundaries: {top: number, right: number, bottom: number, left: number}): string => {
  let boundaryHit = '';
  if (obj.x + obj.radius > boundaries.right) {
    boundaryHit = 'right';
  } else if (obj.x - obj.radius < boundaries.left) {
    boundaryHit = 'left';
  }
  if(obj.y + obj.radius >= boundaries.bottom) {        
    boundaryHit = 'bottom';
  } else if (obj.y - obj.radius < boundaries.top) {
    boundaryHit = 'top';
  }
  return boundaryHit;
};

export const runBallPaddleCheck = (ball : any, paddle : any) : string => {
  let paddleHit = '';

  if (ball[0].y + ball[0].radius >= paddle[0].y) {
    console.log("stage 1");
    if(paddle[0].x < ball[0].x + ball[0].radius){
      console.log("stage 2");
      if(paddle[0].x + paddle[0].width > ball[0].x - ball[0].radius){
          console.log("hit top");
          paddleHit = 'top';
      }
    }
  }

  if(paddle[0].x > ball[0].x + ball[0].radius && paddle[0].x < ball[0].x + ball[0].radius){
    console.log("stage 2");
    if(ball[0].y + ball[0].radius >= paddle[0].y && ball[0].y - ball[0].radius <= paddle[0].y + paddle[0].height){
        console.log("hit left or right");
        paddleHit = 'left';
    }
  }

  return paddleHit;
}
export const runBallBrickCheck = (ball : any, brick : any) : string => {
  let brickHit = '';

  if (ball.y + ball.radius >= brick.y && ball.y - ball.radius <= brick.y + brick.height) {
    if(brick.x < ball.x + ball.radius){                                                   
      console.log("brick stage 2");
      if(brick.x + brick.width > ball.x - ball.radius){
          console.log("hit brick top");
          brickHit = 'top';
      }
    }
  }

  if (ball.y - ball.radius <= brick.y + brick.height) {
    if(brick.x < ball.x + ball.radius){
      console.log("brick stage 2");
      if(brick.x + brick.width > ball.x + ball.radius){
          console.log("hit brick bottom");
          brickHit = 'bottom';
      }
    }
  }

  if(brick.x > ball.x + ball.radius && brick.x < ball.x + ball.radius){
    console.log("brick stage 2");
    if(ball.y + ball.radius >= brick.y && ball.y - ball.radius <= brick.y + brick.height){
        console.log("hit brick left or right");
        brickHit = 'left';
    }
  }

  return brickHit;
}