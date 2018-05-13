import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'duration'
})
export class DurationPipe implements PipeTransform {

  transform(value: number, unit = 's', decimals = 2): string {
    if (!value)  {
      return '';
    }

    switch (unit) {
      case 's': return (value / 1000).toFixed(decimals) + 's';
      case 'ms': return value + 'ms';
    }
  }

}
