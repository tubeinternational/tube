import { Injectable } from '@angular/core';
import { COUNTRIES } from '../data/countries.data';
import { Country } from '../models/countries.model';

@Injectable({
  providedIn: 'root'
})
export class CountriesService {

  getAllCountries(): Country[] {
    return COUNTRIES;
  }

  getCountryByName(name: string): Country | undefined {
    return COUNTRIES.find(
      c => c.country.toLowerCase() === name.toLowerCase()
    );
  }
}
