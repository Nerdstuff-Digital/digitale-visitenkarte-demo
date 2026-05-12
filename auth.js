const SUPABASE_URL = 'https://fowpadrwpuuwugskzauj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_6vNM_zVfFfcCjaI5TQRbWQ_X6swaIFk';
const authClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function loginUser(email, password) {
    const { data, error } = await authClient.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
}

async function logoutUser() {
    sessionStorage.removeItem('visitenkarte_preview'); 
    localStorage.removeItem('visitenkarte_preview'); 
    let logoutWarn = '';
    try {
        const { error } = await authClient.auth.signOut();
        if (error) logoutWarn = '?logout=warn';
    } catch (err) {
        logoutWarn = '?logout=warn';
    }
    window.location.replace('./login.html' + logoutWarn);
}

async function requireAuth() {
    let session = null;
    try {
        const result = await authClient.auth.getSession();
        session = result?.data?.session || null;
    } catch (err) {
        console.error('getSession Fehler:', err);
    }
    if (!session) {
        try {
            const result = await authClient.auth.refreshSession();
            session = result?.data?.session || null;
        } catch (err) {
            console.error('refreshSession Fehler:', err);
        }
    }
    if (!session) {
        const pendingRecovery = sessionStorage.getItem('pending_recovery') === '1';
        const redirect = pendingRecovery ? './login.html#type=recovery' : './login.html';
        window.location.replace(redirect);
        await new Promise(() => {});
        return null;
    }
    return session;
}

async function getAuthenticatedClient() {
    return authClient;
}