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
    if(paddle[0].x <= ball[0].x + ball[0].radius + 1){
      if(paddle[0].x + paddle[0].width >= ball[0].x - ball[0].radius - 1){
        paddleHit = 'top';
      }
    }
  }

  if(paddle[0].x - 5 >= ball[0].x + ball[0].radius && paddle[0].x <= ball[0].x + ball[0].radius + 1){
    if(ball[0].y + ball[0].radius >= paddle[0].y - 1){
      paddleHit = 'left';
    }
  }

  if(paddle[0].x + paddle[0].width - 1 >= ball[0].x - ball[0].radius && paddle[0].x + paddle[0].width <= ball[0].x - ball[0].radius + 5){
    if(ball[0].y + ball[0].radius >= paddle[0].y - 1){
      paddleHit = 'right';
    }
  }

  return paddleHit;
}
export const runBallBrickCheck = (ball : any, brick : any) : string => {
  let brickHit = '';

  if (ball.y + ball.radius >= brick.y && ball.y - ball.radius <= brick.y + brick.height) {
    if(brick.x < ball.x + ball.radius){                                                   
      if(brick.x + brick.width > ball.x - ball.radius){
          brickHit = 'top';
      }
    }
  }

  if (ball.y - ball.radius <= brick.y + brick.height) {
    if(brick.x < ball.x + ball.radius){
      if(brick.x + brick.width > ball.x + ball.radius){
          brickHit = 'bottom';
      }
    }
  }

  if(brick.x == ball.x + ball.radius){
    if(ball.y + ball.radius >= brick.y && ball.y - ball.radius <= brick.y + brick.height){
        brickHit = 'left';
    }
  }

  if(brick.x + brick.width == ball.x - ball.radius){
    if(ball.y + ball.radius >= brick.y && ball.y - ball.radius <= brick.y + brick.height){
        brickHit = 'right';
    }
  }

  return brickHit;
}