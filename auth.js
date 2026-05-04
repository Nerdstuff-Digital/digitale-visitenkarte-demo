const SUPABASE_URL = 'https://fowpadrwpuuwugskzauj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_6vNM_zVfFfcCjaI5TQRbWQ_X6swaIFk';

const authClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function loginUser(email, password) {
    const { data, error } = await authClient.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
}

async function logoutUser() {
    sessionStorage.removeItem('dev_mode');
    const { error } = await authClient.auth.signOut();
    if (error) throw error;
    window.location.href = './login.html';
}

async function requireAuth() {
    const { data: { session } } = await authClient.auth.getSession();
    if (!session) {
        window.location.href = './login.html';
        return null;
    }
    return session;
}

async function getAuthenticatedClient() {
    return authClient;
}
