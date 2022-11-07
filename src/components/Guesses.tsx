import { Box, FlatList, useToast } from 'native-base';
import { useState, useEffect } from "react";
import { api } from "../services/api";
import { Game, GameProps } from '../components/Game'
import { Loading } from './Loading';
import { EmptyMyPoolList } from './EmptyMyPoolList';



interface Props {
  poolId: string;
  code: string;
}

export function Guesses({ poolId, code }: Props) {

  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [games, setGames] = useState<GameProps[]>([]);
  const [firstTeamPoints, setFirstTeamPoints] = useState('');
  const [secondTeamPoints, setSecondTeamPoints] = useState('');


  async function fetchGames(){
  try {
    setIsLoading(true)
    const response = await api.get(`/pools/${poolId}/games`);
    setGames(response.data.games)
  } catch (error) {
    console.log(error)
    toast.show({
        title:'Não foi possível exibir os detalhes do bolão',
        placement: 'top',
        bgColor: 'red.500',
    })
  } finally {
    setIsLoading(false)
  }
  }

  async function handleGuessConfirm(gameId: string){
    try {

      if (!firstTeamPoints.trim() || !secondTeamPoints.trim()) {
          return (toast.show({
          title:'Informe o placar para do plapite',
          placement: 'top',
          bgColor: 'red.500',
      }))
      }

      await api.post(`/pools/${poolId}/games/${gameId}/guesses`, {
        firstTeamPoints: Number(firstTeamPoints),
        secondTeamPoints: Number(secondTeamPoints),
      });

      toast.show({
        title:'Palpite realizado com sucesso',
        placement: 'top',
        bgColor: 'green.500',
    });

    fetchGames();

    } catch (error) {
      console.log(error)
      console.log(error.response?.data?.message)
      if(error.response?.data?.message === 'You Cannot send guesses after the game date'){
          return(toast.show({title: 'Você não pode enviar um palpite a um jogo já encerrado.', placement: 'top', bgColor: 'red.500'}))
      }
      if(error.response?.data?.message === 'Game not found'){
          return(toast.show({title: 'Jogo não encontrado', placement: 'top', bgColor: 'red.500'}))
      }

      if(error.response?.data?.message === 'You re not allowed to create a guess inside this pool.'){
        return(toast.show({title: 'Voê não tem permissão de acessar esse jogo', placement: 'top', bgColor: 'red.500'}))
      }
      
      if(error.response?.data?.message === 'You already sent a guess to this game on this pool'){
        return(toast.show({title: 'Voê já enviou um palpite para este jogo', placement: 'top', bgColor: 'red.500'}))
      }
      toast.show({title: 'Não foi possível enviar o palpite', placement: 'top', bgColor: 'red.500'})
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchGames();
  },[poolId])

    if(isLoading) {
      return <Loading />
    }

  return (
      <FlatList 
        data={games}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <Game
            data={item}
            setFirstTeamPoints={setFirstTeamPoints}
            setSecondTeamPoints={setSecondTeamPoints}
            onGuessConfirm={() => handleGuessConfirm(item.id)}
          />
          )}
          _contentContainerStyle={{pb: 10}}
          ListEmptyComponent={() => <EmptyMyPoolList code={code}/>}
      />
  );
}
