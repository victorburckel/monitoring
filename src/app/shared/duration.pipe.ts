import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'duration'
})
export class DurationPipe implements PipeTransform {

  transform(value: number, unit: string): string {
    switch (unit) {
      case 's': return value / 1000 + 's';
      case 'ms': return value + 'ms';
    }
  }

}
