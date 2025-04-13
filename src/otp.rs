use std::time::{Duration, SystemTime, UNIX_EPOCH};

#[derive(Debug, Clone)]
pub struct OTP {
    pub token: u16,
    pub created_at: SystemTime,
}

impl OTP {
    pub fn new() -> Self {
        let now = SystemTime::now();
        Self {
            token: rand::random(),
            created_at: now,
        }
    }
    pub fn is_expired(&self) -> bool {
        let now = SystemTime::now();
        let now_since_epoch = now.duration_since(UNIX_EPOCH).unwrap();

        self.created_at.duration_since(UNIX_EPOCH).unwrap() + Duration::from_secs(5 * 60)
            <= now_since_epoch
    }
    pub fn is_matching(&self, token: u16) -> bool {
        self.token == token
    }
    pub fn is_valid(&self, token: u16) -> bool {
        self.is_matching(token) && !self.is_expired()
    }
}

impl Default for OTP {
    fn default() -> Self {
        Self {
            token: rand::random(),
            created_at: SystemTime::now(),
        }
    }
}
