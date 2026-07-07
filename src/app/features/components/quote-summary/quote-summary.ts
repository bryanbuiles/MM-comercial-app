import { Component, input, output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { LucideClipboardList, LucideDownload, LucidePackage } from '@lucide/angular';
import { Product } from '@shared/models/product-interface';

@Component({
  selector: 'app-quote-summary',
  imports: [CurrencyPipe, LucideClipboardList, LucideDownload, LucidePackage],
  templateUrl: './quote-summary.html',
})
export class QuoteSummary {
  readonly products = input<Product[]>([]);
  readonly generate = output<void>();
}
