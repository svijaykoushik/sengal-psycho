/**
 *Helper class
 */
export class Helper {
  static random(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  static clamp(val: number, minVal: number, maxVal: number) {
    return Math.max(minVal, Math.min(val, maxVal));
  }
}