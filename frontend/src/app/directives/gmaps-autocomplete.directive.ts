import { isPlatformBrowser } from '@angular/common';
import {
  Directive,
  ElementRef,
  EventEmitter,
  Inject,
  OnDestroy,
  OnInit,
  Output,
  PLATFORM_ID,
} from '@angular/core';

type ExtendedPlacesLibrary = google.maps.PlacesLibrary & {
  AutocompleteSessionToken: typeof google.maps.places.AutocompleteSessionToken;
  AutocompleteSuggestion: typeof google.maps.places.AutocompleteSuggestion;
  Place: typeof google.maps.places.Place;
};

type PopularAirportConfig = {
  query: string;
  label: string;
  secondary?: string;
};

@Directive({
  selector: '[appGmapsAutocomplete]',
})
export class GmapsAutocompleteDirective implements OnInit, OnDestroy {
  @Output() placeChanged = new EventEmitter<google.maps.places.PlaceResult>();
  @Output() placeResolving = new EventEmitter<void>();
  @Output() placeResolved = new EventEmitter<void>();

  private sessionToken?: google.maps.places.AutocompleteSessionToken;
  private placesLibraryPromise?: Promise<ExtendedPlacesLibrary>;
  private suggestionContainer?: HTMLDivElement;
  private inputWrapper?: HTMLElement;
  private highlightedIndex = -1;
  private predictions: google.maps.places.PlacePrediction[] = [];
  private suppressPredictionRequest = false;
  private popularPredictionDisplay = new WeakMap<
    google.maps.places.PlacePrediction,
    { main: string; secondary?: string }
  >();
  private popularPredictions: google.maps.places.PlacePrediction[] = [];
  private popularPredictionsPromise?: Promise<void>;
  private predictionDebounceTimer?: number;

  private inputListener?: (event: Event) => void;
  private keydownListener?: (event: KeyboardEvent) => void;
  private focusListener?: () => void;
  private blurListener?: () => void;
  private documentClickListener?: (event: MouseEvent) => void;
  private repositionListener?: () => void;
  private resizeListener?: () => void;

  constructor(
    private readonly elementRef: ElementRef<HTMLInputElement>,
    @Inject(PLATFORM_ID) private readonly platformId: object,
  ) {}

  private readonly popularAirports: PopularAirportConfig[] = [
    {
      query: 'Antalya Airport',
      label: 'Antalya Airport (AYT)',
      secondary: 'Antalya, Türkiye',
    },
    {
      query: 'Istanbul Airport',
      label: 'Istanbul Airport (IST)',
      secondary: 'Arnavutköy, İstanbul, Türkiye',
    },
    {
      query: 'Sabiha Gökçen Airport',
      label: 'Sabiha Gökçen Airport (SAW)',
      secondary: 'Pendik, İstanbul, Türkiye',
    },
    {
      query: 'Gazipaşa-Alanya Airport',
      label: 'Gazipaşa-Alanya Airport (GZP)',
      secondary: 'Gazipaşa, Antalya, Türkiye',
    },
    {
      query: 'Dalaman Airport',
      label: 'Dalaman Airport (DLM)',
      secondary: 'Dalaman, Muğla, Türkiye',
    },
  ];

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (!window['google'] || !google.maps) {
      console.error('Google Maps API is not loaded.');
      return;
    }

    this.initializeListeners();
  }

  ngOnDestroy(): void {
    this.destroySuggestionContainer();
    this.removeListeners();
    this.sessionToken = undefined;
    this.placesLibraryPromise = undefined;
    this.inputWrapper = undefined;
    this.clearPredictionDebounce();
  }

  private initializeListeners(): void {
    const hostInput = this.elementRef.nativeElement;
    this.inputWrapper = hostInput.closest('.input-wrapper') ?? undefined;

    hostInput.setAttribute('autocomplete', 'off');
    hostInput.setAttribute('autocapitalize', 'off');
    hostInput.setAttribute('autocorrect', 'off');
    hostInput.setAttribute('spellcheck', 'false');

    this.inputListener = (event: Event) => {
      if (this.suppressPredictionRequest) {
        return;
      }
      const target = event.target as HTMLInputElement;
      const value = target.value ?? '';
      if (!value.trim()) {
        this.clearPredictionDebounce();
        void this.showPopularAirports();
        return;
      }
      this.schedulePredictionFetch(value);
    };
    hostInput.addEventListener('input', this.inputListener);

    this.keydownListener = (event: KeyboardEvent) => {
      this.handleKeydown(event);
    };
    hostInput.addEventListener('keydown', this.keydownListener);

    this.focusListener = () => {
      const value = hostInput.value ?? '';
      if (!value.trim()) {
        void this.showPopularAirports();
        return;
      }
      this.schedulePredictionFetch(value);
    };
    hostInput.addEventListener('focus', this.focusListener);

    this.blurListener = () => {
      // Delay closing to allow click events to register.
      this.clearPredictionDebounce();
      setTimeout(() => this.hideSuggestions(), 150);
    };
    hostInput.addEventListener('blur', this.blurListener);

    this.documentClickListener = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        !this.elementRef.nativeElement.contains(target) &&
        !this.suggestionContainer?.contains(target)
      ) {
        this.hideSuggestions();
      }
    };
    document.addEventListener('click', this.documentClickListener);
  }

  private removeListeners(): void {
    const hostInput = this.elementRef.nativeElement;

    if (this.inputListener) {
      hostInput.removeEventListener('input', this.inputListener);
      this.inputListener = undefined;
    }

    if (this.keydownListener) {
      hostInput.removeEventListener('keydown', this.keydownListener);
      this.keydownListener = undefined;
    }

    if (this.focusListener) {
      hostInput.removeEventListener('focus', this.focusListener);
      this.focusListener = undefined;
    }

    if (this.blurListener) {
      hostInput.removeEventListener('blur', this.blurListener);
      this.blurListener = undefined;
    }

    if (this.documentClickListener) {
      document.removeEventListener('click', this.documentClickListener);
      this.documentClickListener = undefined;
    }
  }

  private async ensurePlacesLibrary(): Promise<ExtendedPlacesLibrary> {
    if (!this.placesLibraryPromise) {
      this.placesLibraryPromise = google.maps.importLibrary('places') as Promise<ExtendedPlacesLibrary>;
    }
    return this.placesLibraryPromise;
  }

  private async ensurePopularPredictions(): Promise<google.maps.places.PlacePrediction[]> {
    if (this.popularPredictions.length) {
      return this.popularPredictions;
    }

    if (this.popularPredictionsPromise) {
      await this.popularPredictionsPromise;
      return this.popularPredictions;
    }

    this.popularPredictionsPromise = this.fetchPopularPredictions();
    try {
      await this.popularPredictionsPromise;
    } finally {
      this.popularPredictionsPromise = undefined;
    }

    return this.popularPredictions;
  }

  private async fetchPopularPredictions(): Promise<void> {
    try {
      const placesLibrary = await this.ensurePlacesLibrary();
      const results = await Promise.all(
        this.popularAirports.map(async (airport): Promise<google.maps.places.PlacePrediction | null> => {
          try {
            const sessionToken = new placesLibrary.AutocompleteSessionToken();
            const request = this.buildAutocompleteRequest(airport.query, sessionToken);
            request.includedPrimaryTypes = ['airport'];
            const { suggestions } =
              await placesLibrary.AutocompleteSuggestion.fetchAutocompleteSuggestions(request);
            const prediction =
              suggestions
                .map((s) => s.placePrediction)
                .find(
                  (item): item is google.maps.places.PlacePrediction =>
                    !!item && item.types?.includes('airport'),
                ) ??
              suggestions.map((s) => s.placePrediction).find(
                (item): item is google.maps.places.PlacePrediction => !!item,
              );

            if (!prediction) {
              return null;
            }

            this.popularPredictionDisplay.set(prediction, {
              main: airport.label,
              secondary: airport.secondary,
            });

            return prediction;
          } catch (error) {
            console.error(`Failed to preload prediction for ${airport.label}:`, error);
            return null;
          }
        }),
      );

      this.popularPredictions = results.filter(
        (prediction): prediction is google.maps.places.PlacePrediction => prediction !== null,
      );
    } catch (error) {
      console.error('Failed to preload popular airport predictions:', error);
      this.popularPredictions = [];
    }
  }

  private async showPopularAirports(): Promise<void> {
    try {
      const predictions = await this.ensurePopularPredictions();
      if (!predictions.length) {
        this.hideSuggestions();
        this.predictions = [];
        this.highlightedIndex = -1;
        return;
      }

      this.predictions = predictions.slice();
      this.highlightedIndex = 0;
      this.renderSuggestions();
    } catch (error) {
      console.error('Failed to display popular airport suggestions:', error);
    }
  }

  private async fetchPredictions(inputValue: string): Promise<void> {
  if (!inputValue || !inputValue.trim()) {
    this.hideSuggestions();
    this.predictions = [];
    this.highlightedIndex = -1;
    return;
  }

  const trimmedInput = inputValue.trim();

  try {
    const placesLibrary = await this.ensurePlacesLibrary();

    this.hideSuggestions();

    if (!this.sessionToken) {
      this.sessionToken = new placesLibrary.AutocompleteSessionToken();
    }

    const request = this.buildAutocompleteRequest(trimmedInput);
    const { suggestions } = await placesLibrary.AutocompleteSuggestion.fetchAutocompleteSuggestions(request);

    // Keep Google’s order — no custom sorting:
    this.predictions = suggestions
      .map((s) => s.placePrediction)
      .filter((p): p is google.maps.places.PlacePrediction => !!p);

    this.highlightedIndex = this.predictions.length ? 0 : -1;
    this.renderSuggestions();
  } catch (error) {
    console.error('Failed to retrieve place predictions:', error);
  }
}


  private buildAutocompleteRequest(
    inputValue: string,
    sessionToken?: google.maps.places.AutocompleteSessionToken,
  ): google.maps.places.AutocompleteRequest {
    const request: google.maps.places.AutocompleteRequest = {
      input: inputValue,
      sessionToken: sessionToken ?? this.sessionToken,
      includedRegionCodes: ['TR'],
    };

    const baseTypes: string[] = [
      'airport',
      'point_of_interest',
      'establishment',
      'locality',
      'street_address',
    ];

    // request.includedPrimaryTypes = this.isLikelyAirportCode(inputValue) ? ['airport'] : baseTypes;

    return request;
  }

  // private sortPredictions(
  //   predictions: google.maps.places.PlacePrediction[],
  //   query: string,
  // ): google.maps.places.PlacePrediction[] {
  //   const normalizedQuery = query.toLowerCase();
  //   const lettersOnlyQuery = normalizedQuery.replace(/[^a-z0-9]/g, '');
  //   const expectAirport = this.isLikelyAirportCode(query);

  //   return predictions
  //     .map((prediction, originalIndex) => {
  //       const combinedText = [
  //         prediction.text?.text ?? '',
  //         prediction.mainText?.text ?? '',
  //         prediction.secondaryText?.text ?? '',
  //       ]
  //         .join(' ')
  //         .toLowerCase();

  //       const lettersOnlyCombined = combinedText.replace(/[^a-z0-9]/g, '');
  //       let score = 0;

  //       if (combinedText.startsWith(normalizedQuery)) {
  //         score += 6;
  //       }

  //       if (normalizedQuery && combinedText.includes(normalizedQuery)) {
  //         score += 4;
  //       }

  //       if (lettersOnlyQuery && lettersOnlyCombined.includes(lettersOnlyQuery)) {
  //         score += 5;
  //       }

  //       if (prediction.types?.includes('airport')) {
  //         score += expectAirport ? 8 : 2;
  //       }

  //       if (prediction.types?.includes('point_of_interest')) {
  //         score += 1;
  //       }

  //       return { prediction, score, originalIndex };
  //     })
  //     .sort((a, b) => {
  //       if (b.score !== a.score) {
  //         return b.score - a.score;
  //       }
  //       return a.originalIndex - b.originalIndex;
  //     })
  //     .map((entry) => entry.prediction);
  // }

  // private isLikelyAirportCode(value: string): boolean {
  //   return /^[a-z]{3}$/i.test(value);
  // }

  private schedulePredictionFetch(inputValue: string): void {
    this.clearPredictionDebounce();

    this.predictionDebounceTimer = window.setTimeout(() => {
      this.predictionDebounceTimer = undefined;
      if (this.suppressPredictionRequest) {
        return;
      }
      void this.fetchPredictions(inputValue);
    }, 250);
  }

  private clearPredictionDebounce(): void {
    if (this.predictionDebounceTimer !== undefined) {
      window.clearTimeout(this.predictionDebounceTimer);
      this.predictionDebounceTimer = undefined;
    }
  }

  private renderSuggestions(): void {
    if (!this.predictions.length) {
      this.hideSuggestions();
      return;
    }

    if (!this.suggestionContainer) {
      this.suggestionContainer = this.createSuggestionContainer();
    }

    this.suggestionContainer.innerHTML = '';

    this.predictions.forEach((prediction, index) => {
      const item = this.createSuggestionItem(prediction, index);
      this.suggestionContainer!.appendChild(item);
    });

    this.positionSuggestionContainer();
    this.applyHighlightStyles();
    this.suggestionContainer.style.display = 'block';
  }

  private createSuggestionContainer(): HTMLDivElement {
    const container = document.createElement('div');
    container.classList.add('gm-autocomplete-panel');
    container.style.position = 'absolute';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = 'auto';
    container.style.zIndex = '2000';
    container.style.background = '#ffffff';
    container.style.borderRadius = '14px';
    container.style.boxShadow = '0 20px 45px -35px rgba(15, 23, 42, 0.55)';
    container.style.padding = '0.35rem 0';
    container.style.maxHeight = '320px';
    container.style.overflowY = 'auto';
    container.style.border = '1px solid rgba(148, 163, 184, 0.25)';
    container.style.boxSizing = 'border-box';
    container.style.display = 'none';

    document.body.appendChild(container);

    this.repositionListener = () => this.positionSuggestionContainer();
    this.resizeListener = () => this.positionSuggestionContainer();
    window.addEventListener('scroll', this.repositionListener, true);
    window.addEventListener('resize', this.resizeListener);

    return container;
  }

  private positionSuggestionContainer(): void {
    if (!this.suggestionContainer) {
      return;
    }

    const anchor = this.inputWrapper ?? this.elementRef.nativeElement;
    const rect = anchor.getBoundingClientRect();

    const topOffset = rect.bottom + window.scrollY + 6;
    const leftOffset = rect.left + window.scrollX;

    this.suggestionContainer.style.width = `${rect.width}px`;
    this.suggestionContainer.style.left = `${leftOffset}px`;
    this.suggestionContainer.style.top = `${topOffset}px`;
  }

  private createSuggestionItem(
    prediction: google.maps.places.PlacePrediction,
    index: number,
  ): HTMLButtonElement {
    const button = document.createElement('button');
    button.type = 'button';
    button.classList.add('gm-autocomplete-option');
    button.dataset['index'] = index.toString();
    button.style.display = 'flex';
    button.style.alignItems = 'flex-start';
    button.style.gap = '0.75rem';
    button.style.width = '100%';
    button.style.padding = '0.75rem 1rem';
    button.style.border = 'none';
    button.style.textAlign = 'left';
    button.style.cursor = 'pointer';
    button.style.color = '#0f172a';
    button.style.fontSize = '0.95rem';
    button.style.fontWeight = '500';
    button.style.transition = 'background 0.2s ease, transform 0.2s ease';

    button.addEventListener('mouseenter', () => {
      this.highlightedIndex = index;
      this.applyHighlightStyles();
    });

    button.addEventListener('mousedown', (event) => {
      event.preventDefault();
    });

    button.addEventListener('click', () => {
      this.hideSuggestions();
      void this.selectPrediction(prediction);
    });

    const iconWrapper = document.createElement('span');
    iconWrapper.style.display = 'grid';
    iconWrapper.style.placeItems = 'center';
    iconWrapper.style.width = '1.2rem';
    iconWrapper.style.height = '1.2rem';
    iconWrapper.style.borderRadius = '999px';
    iconWrapper.style.background = 'rgba(37, 99, 235, 0.12)';
    iconWrapper.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M12 2C8.14 2 5 5.13 5 8.99c0 4.88 5.6 10.54 6.37 11.29.35.34.91.34 1.26 0 .76-.75 6.37-6.41 6.37-11.29C19 5.13 15.86 2 12 2Zm0 8.25a2.25 2.25 0 1 1 0-4.5 2.25 2.25 0 0 1 0 4.5Z" fill="currentColor" />
      </svg>
    `;
    iconWrapper.style.color = '#2563eb';

    const textWrapper = document.createElement('span');
    textWrapper.style.display = 'grid';
    textWrapper.style.gap = '0.25rem';

    const { main, secondary } = this.getSuggestionTexts(prediction);

    const mainLine = document.createElement('span');
    mainLine.textContent = main;
    mainLine.style.fontWeight = '600';
    mainLine.style.fontSize = '0.98rem';

    const secondaryLine = document.createElement('span');
    secondaryLine.textContent = secondary ?? '';
    secondaryLine.style.fontSize = '0.85rem';
    secondaryLine.style.color = '#64748b';

    textWrapper.appendChild(mainLine);
    if (secondaryLine.textContent) {
      textWrapper.appendChild(secondaryLine);
    }

    button.append(iconWrapper, textWrapper);
    return button;
  }

  private applyHighlightStyles(): void {
    if (!this.suggestionContainer) {
      return;
    }

    Array.from(this.suggestionContainer.children).forEach((child, idx) => {
      const element = child as HTMLElement;
      if (idx === this.highlightedIndex) {
        element.style.background = 'rgba(59, 130, 246, 0.12)';
        element.style.transform = 'translateX(4px)';
      } else {
        element.style.background = 'transparent';
        element.style.transform = 'translateX(0)';
      }
    });
  }

  private hideSuggestions(): void {
    if (this.suggestionContainer) {
      this.suggestionContainer.style.display = 'none';
    }
    this.highlightedIndex = -1;
    this.applyHighlightStyles();
  }

  private destroySuggestionContainer(): void {
    if (this.suggestionContainer?.parentNode) {
      this.suggestionContainer.parentNode.removeChild(this.suggestionContainer);
    }
    this.suggestionContainer = undefined;
    this.predictions = [];
    this.highlightedIndex = -1;

    if (this.repositionListener) {
      window.removeEventListener('scroll', this.repositionListener, true);
      this.repositionListener = undefined;
    }

    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
      this.resizeListener = undefined;
    }
  }

  private handleKeydown(event: KeyboardEvent): void {
    if (!this.predictions.length) {
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.highlightedIndex = Math.min(this.highlightedIndex + 1, this.predictions.length - 1);
        this.applyHighlightStyles();
        this.scrollHighlightedIntoView();
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.highlightedIndex = Math.max(this.highlightedIndex - 1, 0);
        this.applyHighlightStyles();
        this.scrollHighlightedIntoView();
        break;
      case 'Enter':
        if (this.highlightedIndex >= 0 && this.highlightedIndex < this.predictions.length) {
          event.preventDefault();
          const prediction = this.predictions[this.highlightedIndex];
          void this.selectPrediction(prediction);
        }
        break;
      case 'Escape':
        this.hideSuggestions();
        break;
      default:
        break;
    }
  }

  private scrollHighlightedIntoView(): void {
    if (!this.suggestionContainer || this.highlightedIndex < 0) {
      return;
    }

    const item = this.suggestionContainer.children[this.highlightedIndex] as HTMLElement | undefined;
    if (item) {
      item.scrollIntoView({ block: 'nearest' });
    }
  }

  private async selectPrediction(prediction: google.maps.places.PlacePrediction): Promise<void> {
    console.log('Selected prediction:', prediction);
    this.placeResolving.emit();
    const fallbackText =
      prediction.text?.text ?? prediction.mainText?.text ?? prediction.secondaryText?.text ?? '';
    try {
      const placeResult = await this.fetchPlaceDetails(prediction.placeId);

      this.suppressPredictionRequest = true;
      if (placeResult) {
        this.elementRef.nativeElement.value =
          placeResult.formatted_address ?? placeResult.name ?? fallbackText;
        this.elementRef.nativeElement.dispatchEvent(new Event('input', { bubbles: true }));
        this.elementRef.nativeElement.dispatchEvent(new Event('change', { bubbles: true }));
        
        this.placeChanged.emit(placeResult);
      } else if (fallbackText) {
        this.elementRef.nativeElement.value = fallbackText;
        this.elementRef.nativeElement.dispatchEvent(new Event('input', { bubbles: true }));
        this.elementRef.nativeElement.dispatchEvent(new Event('change', { bubbles: true }));
      }
    } catch (error) {
      console.error('Failed to retrieve place details:', error);
      if (fallbackText) {
        this.elementRef.nativeElement.value = fallbackText;
        this.elementRef.nativeElement.dispatchEvent(new Event('input', { bubbles: true }));
        this.elementRef.nativeElement.dispatchEvent(new Event('change', { bubbles: true }));
      }
    } finally {
      setTimeout(() => {
        this.suppressPredictionRequest = false;
      }, 0);

      this.hideSuggestions();
      this.predictions = [];
      this.highlightedIndex = -1;

      if (this.sessionToken) {
        const placesLibrary = await this.ensurePlacesLibrary();
        this.sessionToken = new placesLibrary.AutocompleteSessionToken();
      }
      this.placeResolved.emit();
    }
  }

  private async fetchPlaceDetails(placeId: string): Promise<google.maps.places.PlaceResult | null> {
    const placesLibrary = await this.ensurePlacesLibrary();

    if (!placesLibrary.Place) {
      console.error('Place class is not available in the Places library.');
      return null;
    }

    const place = new placesLibrary.Place({ id: placeId });

    const response = await place.fetchFields({
      fields: [
        'addressComponents',
        'displayName',
        'formattedAddress',
        'id',
        'location',
        'types',
        'viewport',
      ],
    });

    return this.toPlaceResult(response.place);
  }

  private toPlaceResult(place: google.maps.places.Place): google.maps.places.PlaceResult {
    const placeResult: google.maps.places.PlaceResult = {};

    if (place.addressComponents) {
      placeResult.address_components = place.addressComponents.map((component) => ({
        long_name: component.longText ?? '',
        short_name: component.shortText ?? '',
        types: component.types ?? [],
      }));
    }

    if (place.displayName) {
      placeResult.name = place.displayName;
    }

    if (place.formattedAddress) {
      placeResult.formatted_address = place.formattedAddress;
    }

    if (place.id) {
      placeResult.place_id = place.id;
    }

    if (place.types) {
      placeResult.types = place.types;
    }

    if (place.location) {
      placeResult.geometry = {
        location: place.location,
        viewport: place.viewport ?? undefined,
      } as google.maps.places.PlaceGeometry;
    }

    return placeResult;
  }

  private getSuggestionTexts(
    prediction: google.maps.places.PlacePrediction,
  ): { main: string; secondary?: string } {
    const override = this.popularPredictionDisplay.get(prediction);
    if (override) {
      return override;
    }

    return {
      main: prediction.mainText?.text ?? prediction.text?.text ?? '',
      secondary: prediction.secondaryText?.text ?? '',
    };
  }
}
