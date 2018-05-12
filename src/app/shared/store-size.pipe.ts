import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'storeSize'
})
export class StoreSizePipe implements PipeTransform {

  transform(value: number, unit: string): string {
    if (!value)  {
      return '';
    }

    switch (unit) {
      case 'kb': return value / 1024 + 'kb';
      case 'mb': return value / (1024 * 1024) + 'mb';
      default: return value + 'b';
    }
  }

}
