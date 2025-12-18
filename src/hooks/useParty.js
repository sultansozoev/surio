import { usePartyContext } from '../context/PartyContext';

export const useParty = () => {
    return usePartyContext();
};

export default useParty;
