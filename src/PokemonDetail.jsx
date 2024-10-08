import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Button,
} from "@mui/material";
import axios from "axios";
import RadarChart from "./RadarChart";

const typeNames = {
  bug: "むし",
  dark: "あく",
  dragon: "ドラゴン",
  electric: "でんき",
  fairy: "フェアリー",
  fighting: "かくとう",
  fire: "ほのお",
  flying: "ひこう",
  ghost: "ゴースト",
  grass: "くさ",
  ground: "じめん",
  ice: "こおり",
  normal: "ノーマル",
  poison: "どく",
  psychic: "エスパー",
  rock: "いわ",
  steel: "はがね",
  water: "みず",
};

function PokemonDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pokemon, setPokemon] = useState(null);
  const [encounters, setEncounters] = useState([]);
  const [evolutionChain, setEvolutionChain] = useState([]);
  const [showDetails, setShowDetails] = useState(false);
  const [showEncounters, setShowEncounters] = useState(false);
  const [showEvolutionChain, setShowEvolutionChain] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [flavorText, setFlavorText] = useState("");

  useEffect(() => {
    const fetchPokemon = async () => {
      try {
        const response = await axios.get(
          `https://pokeapi.co/api/v2/pokemon/${id}`
        );
        const { name, sprites, height, weight, types, stats, abilities } =
          response.data;
        const speciesUrl = response.data.species.url;
        const speciesResponse = await axios.get(speciesUrl);
        const names = speciesResponse.data.names;
        const japaneseName = names.find((name) => name.language.name === "ja");

        const flavorTextEntries = speciesResponse.data.flavor_text_entries;
        const japaneseFlavorText =
          flavorTextEntries.find((entry) => entry.language.name === "ja")
            ?.flavor_text || "説明文が見つかりませんでした";

        const typesInJapanese = types
          .map((type) => typeNames[type.type.name] || type.type.name)
          .join(", ");

        const abilitiesData = await Promise.all(
          abilities.map(async (abilityInfo) => {
            const abilityUrl = abilityInfo.ability.url;
            const abilityResponse = await axios.get(abilityUrl);
            const abilityNames = abilityResponse.data.names;
            const japaneseAbility = abilityNames.find(
              (name) => name.language.name === "ja"
            );
            const flavorTextEntries = abilityResponse.data.flavor_text_entries;
            const japaneseDescription = flavorTextEntries.find(
              (entry) => entry.language.name === "ja"
            );

            return {
              name: japaneseAbility
                ? japaneseAbility.name
                : abilityInfo.ability.name,
              description: japaneseDescription
                ? japaneseDescription.flavor_text
                : "説明が見つかりませんでした",
            };
          })
        );

        const statsData = {
          hp: stats.find((stat) => stat.stat.name === "hp")?.base_stat || 0,
          attack:
            stats.find((stat) => stat.stat.name === "attack")?.base_stat || 0,
          defense:
            stats.find((stat) => stat.stat.name === "defense")?.base_stat || 0,
          specialAttack:
            stats.find((stat) => stat.stat.name === "special-attack")
              ?.base_stat || 0,
          specialDefense:
            stats.find((stat) => stat.stat.name === "special-defense")
              ?.base_stat || 0,
          speed:
            stats.find((stat) => stat.stat.name === "speed")?.base_stat || 0,
        };

        const encountersResponse = await axios.get(
          `https://pokeapi.co/api/v2/pokemon/${id}/encounters`
        );
        const encounterPromises = encountersResponse.data.map(
          async (encounter) => {
            const locationResponse = await axios.get(
              encounter.location_area.url
            );
            return {
              name: locationResponse.data.name,
              url: encounter.location_area.url,
            };
          }
        );
        const encounterLocations = await Promise.all(encounterPromises);

        const evolutionChainUrl = speciesResponse.data.evolution_chain.url;
        const evolutionChainResponse = await axios.get(evolutionChainUrl);
        const chain = evolutionChainResponse.data.chain;

        const getJapaneseName = async (url) => {
          const response = await axios.get(url);
          const names = response.data.names;
          const japaneseName = names.find(
            (name) => name.language.name === "ja"
          );
          return japaneseName ? japaneseName.name : response.data.name;
        };

        const evolutionData = [];
        const processEvolution = async (node) => {
          const evoDetails = node.evolution_details[0];
          const japaneseSpeciesName = await getJapaneseName(node.species.url);
          evolutionData.push({
            species_name: japaneseSpeciesName,
            min_level: evoDetails ? evoDetails.min_level : null,
            trigger_name: evoDetails ? evoDetails.trigger.name : null,
            item: evoDetails ? evoDetails.item : null,
            species_url: node.species.url,
          });

          if (node.evolves_to.length > 0) {
            for (const evo of node.evolves_to) {
              await processEvolution(evo);
            }
          }
        };
        await processEvolution(chain);

        setPokemon({
          name: japaneseName ? japaneseName.name : name,
          image: sprites.front_default,
          height,
          weight,
          types: typesInJapanese,
          abilities: abilitiesData,
          flavorText: japaneseFlavorText,
          stats: statsData,
        });
        setEncounters(encounterLocations);
        setEvolutionChain(evolutionData);

        setFlavorText(japaneseFlavorText);
      } catch (error) {
        console.error("ポケモン詳細の取得に失敗しました", error);
      }
    };

    fetchPokemon();
  }, [id]);

  const handleEvolutionClick = (url) => {
    const pokemonId = url.split("/").slice(-2, -1)[0];
    navigate(`/pokemon/${pokemonId}`);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ flexGrow: 1, bgcolor: "#e0f7fa", padding: 2 }}>
        <Box
          sx={{
            position: "fixed",
            bottom: 16,
            left: 16,
            zIndex: 10,
          }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/")}
            size="large"
            sx={{
              fontSize: "1.25rem",
              padding: "12px 24px",
              boxShadow: 3,
            }}
          >
            戻る
          </Button>
        </Box>
        {pokemon ? (
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  maxWidth: 700,
                  margin: "auto",
                  boxShadow: 3,
                  borderRadius: 2,
                }}
              >
                <Typography
                  variant="h3"
                  align="center"
                  gutterBottom
                  sx={{
                    fontSize: "4.5rem",
                    fontWeight: "bold",
                    color: "#00796b",
                  }}
                >
                  {pokemon.name}
                </Typography>
                <CardMedia
                  component="img"
                  alt={pokemon.name}
                  height="400"
                  image={pokemon.image}
                  sx={{
                    objectFit: "contain",
                    width: "100%",
                  }}
                />
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  boxShadow: 3,
                  borderRadius: 2,
                }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    基本情報
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="高さ"
                        secondary={`${pokemon.height} m`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="重さ"
                        secondary={`${pokemon.weight} kg`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="タイプ"
                        secondary={pokemon.types}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="説明" secondary={flavorText} />
                    </ListItem>
                  </List>
                </CardContent>
                <Box sx={{ textAlign: "center", padding: 2 }}>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => setShowStats((prev) => !prev)}
                  >
                    {showStats
                      ? "レーダーチャートを非表示"
                      : "レーダーチャートを表示"}
                  </Button>
                </Box>
                {showStats && (
                  <CardContent>
                    <RadarChart stats={pokemon.stats} />
                  </CardContent>
                )}
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => setShowDetails((prev) => !prev)}
                >
                  {showDetails ? "詳細を隠す" : "詳細を表示"}
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => setShowEncounters((prev) => !prev)}
                >
                  {showEncounters ? "出現場所を隠す" : "出現場所を表示"}
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => setShowEvolutionChain((prev) => !prev)}
                >
                  {showEvolutionChain ? "進化情報を隠す" : "進化情報を表示"}
                </Button>
              </Box>
              {showDetails && (
                <Card sx={{ marginTop: 2, boxShadow: 3, borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                      特性
                    </Typography>
                    <List>
                      {pokemon.abilities.map((ability, index) => (
                        <ListItem key={index}>
                          <ListItemText
                            primary={ability.name}
                            secondary={ability.description}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              )}
              {showEncounters && (
                <Card sx={{ marginTop: 2, boxShadow: 3, borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                      出現場所
                    </Typography>
                    <List>
                      {encounters.map((encounter, index) => (
                        <ListItem key={index}>
                          <ListItemText primary={encounter.name} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              )}
              {showEvolutionChain && (
                <Grid item xs={12}>
                  <Card sx={{ marginTop: 2, boxShadow: 3, borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                        進化情報
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "row",
                          overflowX: "auto",
                        }}
                      >
                        {evolutionChain.map((evolution, index) => (
                          <Box
                            key={index}
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              marginX: 1,
                            }}
                          >
                            <Typography
                              variant="body1"
                              sx={{
                                cursor: "pointer",
                                textAlign: "center",
                                marginBottom: 1,
                              }}
                              onClick={() =>
                                handleEvolutionClick(evolution.species_url)
                              }
                            >
                              {evolution.species_name}
                            </Typography>
                            {evolution.min_level && (
                              <Typography
                                variant="body2"
                                sx={{ textAlign: "center" }}
                              >
                                進化レベル: {evolution.min_level}
                              </Typography>
                            )}
                            {!evolution.min_level && evolution.trigger_name && (
                              <Typography
                                variant="body2"
                                sx={{ textAlign: "center" }}
                              >
                                進化トリガー: {evolution.trigger_name}
                              </Typography>
                            )}
                          </Box>
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          </Grid>
        ) : (
          <Typography variant="h4" align="center">
            ローディング中...
          </Typography>
        )}
      </Box>
    </Container>
  );
}

export default PokemonDetail;
