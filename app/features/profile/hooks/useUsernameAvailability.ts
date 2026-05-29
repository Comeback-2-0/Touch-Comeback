import {useEffect, useMemo, useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {checkUsername} from '../api/profileApi';

const USERNAME_REGEX = /^[a-z0-9._]{3,30}$/;

export function normalizeUsername(value: string) {
  return value.trim().toLowerCase();
}

export function isValidUsernameFormat(value: string) {
  return USERNAME_REGEX.test(normalizeUsername(value));
}

export function useUsernameAvailability(username: string, currentUsername = '') {
  const normalized = normalizeUsername(username);
  const normalizedCurrent = normalizeUsername(currentUsername);
  const [debouncedUsername, setDebouncedUsername] = useState(normalized);
  const isValidFormat = isValidUsernameFormat(normalized);
  const isUnchanged = normalized.length > 0 && normalized === normalizedCurrent;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedUsername(normalized), 400);
    return () => clearTimeout(timer);
  }, [normalized]);

  const query = useQuery({
    queryKey: ['profile', 'username', debouncedUsername],
    queryFn: () => checkUsername(debouncedUsername),
    enabled: isValidFormat && !isUnchanged && debouncedUsername === normalized,
    retry: 1,
    staleTime: 30_000,
  });

  const available = useMemo(() => {
    if (!normalized || !isValidFormat) return false;
    if (isUnchanged) return true;
    return query.data === true;
  }, [isUnchanged, isValidFormat, normalized, query.data]);

  const message = useMemo(() => {
    if (!normalized) return 'Username is required';
    if (!isValidFormat) return 'Use 3-30 letters, numbers, underscores, or periods';
    if (isUnchanged) return 'Current username';
    if (query.isFetching) return 'Checking username...';
    if (query.isError) return 'Could not check username';
    if (query.data === true) return 'Username is available';
    if (query.data === false) return 'Username is unavailable';
    return 'Keep typing to check availability';
  }, [isUnchanged, isValidFormat, normalized, query.data, query.isError, query.isFetching]);

  return {
    available,
    isChecking: query.isFetching,
    isValidFormat,
    message,
  };
}
