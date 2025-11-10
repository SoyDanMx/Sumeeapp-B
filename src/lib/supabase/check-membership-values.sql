-- Query rápida para ver los valores actuales de membership_status
SELECT 
  membership_status,
  role,
  COUNT(*) as total
FROM public.profiles
GROUP BY membership_status, role
ORDER BY membership_status, role;

-- Ver ejemplos de cada tipo
SELECT 
  full_name,
  email,
  role,
  membership_status,
  created_at
FROM public.profiles
ORDER BY membership_status, created_at DESC
LIMIT 20;

