import { CurrencyPipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { LucideClipboardList, LucideDownload, LucidePackage } from '@lucide/angular';
import { ProductPLus } from '@shared/models/product-interface';

@Component({
  selector: 'app-quote-summary',
  imports: [CurrencyPipe, LucideClipboardList, LucideDownload, LucidePackage],
  templateUrl: './quote-summary.html',
})
export class QuoteSummary {
  readonly products = input<ProductPLus[]>([]);
  readonly generate = output<void>();
}
