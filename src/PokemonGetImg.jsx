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
  ThemeProvider,
  createTheme,
  CssBaseline,
} from "@mui/material";
import axios from "axios";
import { Link } from "react-router-dom";

function PokemonGetImg() {
  //UIの名前とidを保持
  const [inputValue, setInputValue] = useState("");
  //ポケモンの画像
  const [pokemons, setPokemons] = useState([]);
  //読み込むポケモンのid
  const [nextId, setNextId] = useState(1);
  //ローディング
  const [loading, setLoading] = useState(false);
  //ダークモード
  const [darkMode, setDarkMode] = useState(false);

  const handleChange = (event) => {
    setInputValue(event.target.value);
  };

  //ポケモンの所得
  const fetchPokemons = async (inputs) => {
    try {
      const pokemonPromises = inputs.map(async (input) => {
        try {
          const response = await axios.get(
            `https://pokeapi.co/api/v2/pokemon/${input.toLowerCase()}`
          );
          const { sprites } = response.data;

          const speciesResponse = await axios.get(
            `https://pokeapi.co/api/v2/pokemon-species/${response.data.id}`
          );
          const japaneseName = speciesResponse.data.names.find(
            (n) => n.language.name === "ja"
          )?.name;

          return {
            id: response.data.id,
            name: japaneseName || response.data.name,
            image: sprites.front_default,
          };
        } catch (error) {
          console.error(`${input} に対応するポケモンが見つかりません`, error);
          return null;
        }
      });

      const results = await Promise.all(pokemonPromises);
      return results.filter((pokemon) => pokemon !== null);
    } catch (error) {
      console.error("ポケモンの取得中にエラーが発生しました", error);
      return [];
    }
  };

  //検索機能
  const handleSearch = async () => {
    const inputs = inputValue
      .split(",")
      .map((item) => item.trim().toLowerCase());
    const newPokemon = await fetchPokemons(inputs);
    setPokemons(newPokemon);
  };

  //もっと読み込む
  const handleLoadMore = async () => {
    setLoading(true);
    const ids = Array.from({ length: 30 }, (_, i) => nextId + i);

    const loading = await fetchPokemons(ids.map(String));
    setPokemons((prevPokemons) => [...prevPokemons, ...loading]);

    setNextId(nextId + 30);
    setLoading(false);
  };

  //初期化ボタン用
  const handleReset = async () => {
    setLoading(true);
    const initialIds = Array.from({ length: 30 }, (_, i) => i + 1);
    const resetPokemons = await fetchPokemons(initialIds.map(String));
    setPokemons(resetPokemons);
    setNextId(31);
    setLoading(false);
  };

  useEffect(() => {
    (async () => {
      const initialIds = Array.from({ length: 30 }, (_, i) => i + 1);
      const version = await fetchPokemons(initialIds.map(String));
      setPokemons(version);
      setNextId(31);
    })();
  }, []);

  //ページトップへの機能
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  //ダークモード
  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
    },
    typography: {
      h6: {
        color: darkMode ? "#ffffff" : "#000000",
        textShadow: darkMode ? "1px 1px 2px rgba(0,0,0,0.5)" : "none",
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xl">
        <Box sx={{ flexGrow: 1, padding: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} align="right">
              <Button
                variant="contained"
                onClick={() => setDarkMode(!darkMode)}
              >
                {darkMode ? "ライトモードに切り替え" : "ダークモードに切り替え"}
              </Button>
            </Grid>

            <Grid item xs={12} align="center">
              <Typography>
                ポケモンのIDか名前(英語)をカンマ区切りで入力（例: 1, 4, 25,
                pikachu）
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

            <Grid item xs={12}>
              <Stack
                direction="row"
                spacing={2}
                flexWrap="wrap"
                justifyContent="center"
              >
                {pokemons.map((pokemon) => {
                  return (
                    <Card
                      key={`pokemon-${pokemon.id}`}
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
                        </CardContent>
                      </Link>
                    </Card>
                  );
                })}
              </Stack>

              <Grid item xs={12} align="center" marginTop={2}>
                <Stack direction="row" spacing={2} justifyContent="center">
                  <Button
                    variant="contained"
                    onClick={handleLoadMore}
                    disabled={loading}
                  >
                    {loading ? "読み込み中..." : "もっと読み込む"}
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={handleReset}
                  >
                    初期化
                  </Button>
                </Stack>
              </Grid>
            </Grid>

            <Grid item xs={12} align="center" marginTop={4}>
              <Button
                variant="contained"
                onClick={handleScrollToTop}
                sx={{ position: "fixed", bottom: 16, left: 16 }}
              >
                ページ上部へ
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default PokemonGetImg;
