import React, { useState, useEffect } from "react";
import {
  TextField,
  Typography,
  Box,
  Grid,
  Container,
  Button,
  Card,
  CardContent,
  CardMedia,
  Stack,
  FormControl,
  FormControlLabel,
  Checkbox,
  FormGroup,
} from "@mui/material";
import axios from "axios";
import { Link } from "react-router-dom";

function PokemonGetImg() {
  const [inputValue, setInputValue] = useState(""); // ポケモンのIDテキストボックスの内容
  const [selectedVersions, setSelectedVersions] = useState([]); // 選択されたゲームバージョン
  const [pokemons, setPokemons] = useState([]); // ポケモン一覧
  const [nextId, setNextId] = useState(1); // 次に取得するポケモンID
  const [loading, setLoading] = useState(false); // ローディング状態
  const [showVersionSearch, setShowVersionSearch] = useState(false); // ゲームバージョン検索ボックスの表示制御

  const handleChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleVersionChange = (event) => {
    const version = event.target.name;
    setSelectedVersions((prevSelected) =>
      prevSelected.includes(version)
        ? prevSelected.filter((v) => v !== version)
        : [...prevSelected, version]
    );
  };

  const fetchPokemons = async (ids, versions) => {
    try {
      const pokemonPromises = ids.map(async (id) => {
        const response = await axios.get(
          `https://pokeapi.co/api/v2/pokemon/${id}`
        );
        const { sprites, game_indices } = response.data;

        const speciesResponse = await axios.get(
          `https://pokeapi.co/api/v2/pokemon-species/${id}`
        );
        const japaneseName = speciesResponse.data.names.find(
          (n) => n.language.name === "ja"
        )?.name;

        console.log(japaneseName, "game_indices", game_indices);

        const gameIndices = game_indices
          .filter((index) => versions.includes(index.version.name))
          .map((index) => ({
            version: index.version.name,
            pokedexNumber: index.game_index,
          }));

        return {
          id: response.data.id,
          name: japaneseName || response.data.name,
          image: sprites.front_default,
          gameIndices,
        };
      });

      const results = await Promise.all(pokemonPromises);

      console.log("result", results);

      // ポケモンを全国図鑑順にソート
      results.sort((a, b) => {
        const aIndex = a.gameIndices.find(
          (index) => index.version === "national"
        );
        const bIndex = b.gameIndices.find(
          (index) => index.version === "national"
        );
        return (
          (aIndex ? aIndex.pokedexNumber : 0) -
          (bIndex ? bIndex.pokedexNumber : 0)
        );
      });

      return results.filter((pokemon) => pokemon !== null);
    } catch (error) {
      console.error("ポケモンの取得に失敗しました", error);
    }
  };

  const handleSearch = async () => {
    const ids = inputValue.split(",").map((item) => item.trim());
    const newPokemon = await fetchPokemons(ids, selectedVersions);
    setPokemons(newPokemon);
  };

  const handleLoadMore = async () => {
    setLoading(true);
    const ids = Array.from({ length: 30 }, (_, i) => nextId + i);

    const loading = await fetchPokemons(ids.map(String), selectedVersions);
    setPokemons((prevPokemons) => [...prevPokemons, ...loading]);

    setNextId(nextId + 30);

    setLoading(false);
  };

  useEffect(() => {
    (async () => {
      const initialIds = Array.from({ length: 30 }, (_, i) => i + 1);
      const version = await fetchPokemons(
        initialIds.map(String),
        selectedVersions
      );
      setPokemons(version);
      setNextId(31);
    })();
  }, [selectedVersions]);

  return (
    <Container maxWidth="xl">
      <Box sx={{ flexGrow: 1, bgcolor: "#f5f5f5", padding: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} align="center">
            <Typography>
              ポケモンのIDか名前(英語)をカンマ区切りで入力（例: 1, 4, 25）
            </Typography>
          </Grid>
          <Grid item xs={12} md={6} align="right">
            <TextField
              value={inputValue}
              onChange={handleChange}
              label="ポケモンのID or ポケモンの名前(英語)"
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6} align="left">
            <Button variant="contained" onClick={handleSearch} fullWidth>
              ポケモンを検索
            </Button>
          </Grid>

          <Grid container spacing={2} justifyContent="flex-end" marginTop={2}>
            <Grid item>
              <Button
                variant="contained"
                onClick={() => setShowVersionSearch(!showVersionSearch)}
              >
                {showVersionSearch
                  ? "ゲームバージョン検索を閉じる"
                  : "ゲームバージョン検索"}
              </Button>
            </Grid>
          </Grid>

          {showVersionSearch && (
            <Grid item xs={12} align="center" marginTop={2}>
              <FormControl component="fieldset">
                <Typography variant="h6">ゲームバージョンを選択</Typography>
                <FormGroup
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: 1,
                  }}
                >
                  {[
                    "red",
                    "blue",
                    "yellow",
                    "gold",
                    "silver",
                    "crystal",
                    "ruby",
                    "sapphire",
                    "emerald",
                    "firered",
                    "leafgreen",
                    "diamond",
                    "pearl",
                    "platinum",
                    "heartgold",
                    "soulsilver",
                    "black",
                    "white",
                    "black-2",
                    "white-2",
                  ].map((version) => (
                    <FormControlLabel
                      key={version}
                      control={
                        <Checkbox
                          checked={selectedVersions.includes(version)}
                          onChange={handleVersionChange}
                          name={version}
                        />
                      }
                      label={version}
                    />
                  ))}
                </FormGroup>
              </FormControl>
            </Grid>
          )}

          <Grid item xs={12}>
            <Stack
              direction="row"
              spacing={2}
              flexWrap="wrap"
              justifyContent="center"
            >
              {pokemons.map((pokemon) => {
                console.log("pokemon", pokemon, pokemon.id);
                return (
                  <Card
                    key={`pokemon-${pokemon.id}`} // 一意のキーを設定
                    sx={{
                      width: 300,
                      margin: 1,
                      boxShadow: 3,
                      transition: "transform 0.2s",
                      "&:hover": {
                        transform: "scale(1.05)",
                      },
                    }}
                  >
                    <Link
                      to={`/pokemon/${pokemon.id}`}
                      style={{ textDecoration: "none" }}
                    >
                      <CardMedia
                        component="img"
                        alt={pokemon.name}
                        height="300"
                        image={pokemon.image}
                        sx={{ objectFit: "cover" }}
                      />
                      <CardContent>
                        <Typography variant="h6" align="center">
                          {pokemon.name}
                        </Typography>
                        <Box mt={1}>
                          <Typography variant="subtitle2" align="center">
                            ゲームインデックス:
                          </Typography>
                          {pokemon.gameIndices.map((index) => (
                            <Typography
                              key={`index-${pokemon.id}-${index.version}-${index.pokedexNumber}`} // 一意のキーを設定
                              variant="body2"
                              align="center"
                            >
                              {index.version}: #{index.pokedexNumber}
                            </Typography>
                          ))}
                        </Box>
                      </CardContent>
                    </Link>
                  </Card>
                );
              })}
            </Stack>
            <Grid container spacing={2} justifyContent="center" marginTop={2}>
              <Grid item>
                <Button
                  variant="contained"
                  onClick={handleLoadMore}
                  disabled={loading}
                >
                  {loading ? "ローディング..." : "もっと表示"}
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}

export default PokemonGetImg;
