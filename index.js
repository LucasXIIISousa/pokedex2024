const { createApp } = Vue;

createApp({
    data() {
        return {
            pokemons: [],
            loading: true,
            searchText: '',
            nextPage: 1,
            isSwitchOn: false,
            isComparing: false,
            showCompareModal: false,
            selectedPokemon1: null,
            selectedPokemon2: null,
            comparedPokemons: null,
        }
    },
    created() {
        this.callAPI();
        window.addEventListener('scroll', this.handleScroll);
    },
    destroyed() {
        window.removeEventListener('scroll', this.handleScroll);
    },
    computed: {
        filteredPokemons() {
            return this.pokemons.filter(pokemon =>
                pokemon.name.toLowerCase().includes(this.searchText.toLowerCase())
            );
        }
    },
    
    methods: {
        async callAPI() {
            try {
                const response = await fetch(`https://pokeapi.co/api/v2/pokemon/?offset=${(this.nextPage - 1) * 151}&limit=${151}`);
                const data = await response.json();
                const pokemonDetailsPromises = data.results.map(async pokemon => this.fetchPokemonData(pokemon.url));
                const pokemonDetails = await Promise.all(pokemonDetailsPromises);
                this.pokemons = [...this.pokemons, ...pokemonDetails];
                this.nextPage++;
                this.loading = false;
            } catch (error) {
                console.error(error);
            }
        },
        async fetchPokemonData(url) {
            try {
                const response = await fetch(url);
                const data = await response.json();
                return {
                    id: data.id,
                    name: data.name,
                    weight: data.weight,
                    stats: data.stats,
                    types: data.types,
                    sprites: data.sprites,
                    showDetails: false,
                };
            } catch (e) {
                console.error(e);
            }
        },
        handleScroll() {
            const bottomOfWindow = document.documentElement.scrollTop + window.innerHeight === document.documentElement.offsetHeight;
            if (bottomOfWindow && !this.loading) {
                this.loading = true;
                this.callAPI();
            }
        },

        getStat(stats, statName) {
            const stat = stats.find(s => s.stat.name === statName);
            return stat ? stat.base_stat : 0;
        },

        selectPokemon(pokemon) {
            if (this.selectedPokemon1 === pokemon) {
                this.selectedPokemon1 = null;
            } else if (this.selectedPokemon2 === pokemon) {
                this.selectedPokemon2 = null;
            } else if (!this.selectedPokemon1) {
                this.selectedPokemon1 = pokemon;
            } else if (!this.selectedPokemon2) {
                this.selectedPokemon2 = pokemon;
            }

            this.checkForComparison();
        },

        toggleCompareMode() {
            this.isComparing = this.isSwitchOn;

            if (this.isComparing && this.selectedPokemon1 && this.selectedPokemon2) {
                this.comparePokemons();
            } else if (!this.isComparing) {
                this.selectedPokemon1 = null;
                this.selectedPokemon2 = null;
                this.showCompareModal = false;
                this.comparedPokemons = null;
            }
        },
        comparePokemons() {
            this.comparedPokemons = [this.selectedPokemon1, this.selectedPokemon2];
            this.showCompareModal = true;
        },

        selectPokemon(pokemon) {
            if (!this.isComparing) return;

            if (this.selectedPokemon1 === pokemon) {
                this.selectedPokemon1 = null;
            } else if (this.selectedPokemon2 === pokemon) {
                this.selectedPokemon2 = null;
            } else if (!this.selectedPokemon1) {
                this.selectedPokemon1 = pokemon;
            } else if (!this.selectedPokemon2) {
                this.selectedPokemon2 = pokemon;
            }

            if (this.selectedPokemon1 && this.selectedPokemon2) {
                this.comparePokemons();
            }
        },

        getStatPercentage(statValue) {
            return (statValue / 255) * 100;
        },

        getTypeClass(type) {
            const classTypeMap = {
                fire: 'fire',
                grass: 'grass',
                water: 'water',
                bug: 'bug',
                normal: 'normal',
                poison: 'poison',
                electric: 'electric',
                ground: 'ground',
                ghost: 'ghost',
                fighting: 'fighting',
                psychic: 'psychic',
                rock: 'rock',
                ice: 'ice',
                steel: 'steel',
                dark: 'dark',
                flying: 'flying',
                fairy: 'fairy',
                dragon: 'dragon',
            };

            return classTypeMap[type] || '';
        },

        getGradientStyle(types) {
            const firstColor = this.getTypeColor(types[0].type.name);
            const secondColor = this.getTypeColor(types[1].type.name);
            return {
                background: `linear-gradient(90deg, ${firstColor} 40%, ${secondColor} 60%)`
            };
        },
        getTypeColor(type) {
            const colorMap = {
                fire: '#c27e10',
                grass: '#4CAF50',
                water: '#00BFFF',
                bug: '#98e880',
                normal: '#A9A9A9',
                poison: '#9e5cda',
                electric: '#ffd365',
                ground: '#9e7e52',
                ghost: '#5626de',
                fighting: '#ba082a',
                psychic: '#e39fa4',
                rock: '#897975',
                ice: '#42bed3',
                steel: '#999999',
                dark: '#12124f',
                flying: '#23f1c7',
                fairy: '#f040f3',
                dragon: '#3263cc',
            };
            return colorMap[type] || '#ffffff';
        }
    }
}).mount("#app");
