import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'storeSize'
})
export class StoreSizePipe implements PipeTransform {

  transform(value: number, unit = 'kb', decimals = 2): string {
    if (!value)  {
      return '';
    }

    switch (unit) {
      case 'kb': return (value / 1024).toFixed(decimals) + 'kb';
      case 'mb': return (value / (1024 * 1024)).toFixed(decimals) + 'mb';
      default: return value + 'b';
    }
  }

}
