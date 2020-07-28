import { useReducer, useEffect } from 'react';
import axios from 'axios';

const ACTIONS = {
  MAKE_REQUEST: 'make-request',
  GET_DATA: 'get-data',
  ERROR: 'error'
}

const PAGE_SIZE = 50

// const BASE_URL = 'https://cors-anywhere.herokuapp.com/https://jobs.github.com/positions.json';
// const BASE_URL = 'https://cors-proxy.htmldriven.com/?url=https://jobs.github.com/positions.json';
const BASE_URL = 'https://thingproxy.freeboard.io/fetch/https://jobs.github.com/positions.json';

function reducer(state, action) {
  switch (action.type) {
    case ACTIONS.MAKE_REQUEST:
      return { loading: true, jobs: [] };
    case ACTIONS.GET_DATA:
      return { ...state, loading: false, jobs: action.payload.jobs, hasNextPage: action.payload.jobs.length === PAGE_SIZE };
    case ACTIONS.ERROR:
      return { ...state, loading: false, error: action.payload.error, jobs: [] };
  
    default:
      return state;
  }
}

export default function useFetchJobs(params, page) {
  const [state, dispatch] = useReducer(reducer, { jobs: [], loading: true });

  useEffect(() => {
    dispatch({ type: ACTIONS.MAKE_REQUEST })

    const cancelToken = axios.CancelToken.source();
    axios.get(BASE_URL, {
      cancelToken: cancelToken.token,
      params: { markdown: true, page, ...params }
    }).then(res => {
      dispatch({ type: ACTIONS.GET_DATA, payload: { jobs: res.data } })
    }).catch(e => {
      if (axios.isCancel(e)) return
      dispatch({ type: ACTIONS.ERROR, payload: { error: e } })
    })

    return () => {
      cancelToken.cancel()
    }
  }, [params, page])

  return state
}