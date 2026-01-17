import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CountriesService } from '../../../../shared/services/countries.service';
import { Country } from '../../../../shared/models/countries.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-countries',
  imports: [CommonModule],
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.scss']
})
export class CountriesComponent implements OnInit {

  countries: Country[] = [];

  constructor(
    private countriesService: CountriesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.countries = this.countriesService.getAllCountries();
  }

  onCountrySelect(country: Country): void {
    this.router.navigate(['/home'], {
      queryParams: { country: country.country }
    });
  }
}
